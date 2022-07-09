const queries = require("../models/raw_queries");
const {
  lolMatchParticipant,
  lolMatchTwitchVods,
  twitchVods,
  twitchAccounts,
  settings,
} = require("../models");
const vodsPerPage = 10;
const roleNames = [
  "ALLY_TOP",
  "ALLY_MIDDLE",
  "ALLY_BOTTOM",
  "ALLY_UTILITY",
  "ALLY_JUNGLE",
  "ENEMY_TOP",
  "ENEMY_MIDDLE",
  "ENEMY_BOTTOM",
  "ENEMY_UTILITY",
  "ENEMY_JUNGLE",
];

/**
 * Find VodLinks for up to a full matchup
 * @param matchupInfo Object with the all the above roleNames as keys.
 *                    roleNames may optionally have a championId as the value to be searched for
 *                    Object may optionally have a 'ROLE' key, with the value being a role string for the desired role
 *                    Object must have a 'PAGE' key for use in pagination
 */

async function matchupSearch(matchupInfo) {
  let params = {
    page: matchupInfo.PAGE,
    limit: vodsPerPage,
    offset: (matchupInfo.PAGE - 1) * vodsPerPage,
  };
  const { wheres, joins, filters } = getMatchupBody(matchupInfo, params);

  const cursor = await settings.getVodlinkPaginationCursor();
  if (cursor) {
    wheres.push(`lm.id < $(cursor)`);
    params.cursor = Number(cursor);
  }

  const baseQuery = `
     FROM 
        lol_matches lm
     ${joins.join("\n")}
     ${wheres.length > 0 ? "WHERE" : ""}
        ${wheres.join("\n\tand ")} 
  `;

  const paginationQuery = `
    SELECT 
      COUNT(DISTINCT lm.id)::int as total,
      $(limit) as limit,
      $(page) as page
    ${baseQuery}
  `;
  const query = `
     SELECT 
        lm.*
     ${baseQuery}
     GROUP BY lm.id
     ORDER by lm.id DESC
     LIMIT $(limit) OFFSET $(offset)
  `;

  const pagination = await queries.one(paginationQuery, params);
  // TODO: abort lolMatch query if pagination results have 0 total
  const lolMatches = await queries.manyOrNone(query, params);

  const counts = await getRoleCounts(
    matchupInfo,
    joins,
    params,
    filters,
    wheres
  );

  const lolMatchIds = [];
  const vodlinkIds = [];
  lolMatches.forEach((match) => {
    lolMatchIds.push(match.id);
  });

  const participants = await lolMatchParticipant.getByMatchIds(lolMatchIds);
  for (const participant of participants) {
    if (participant.lol_match_twitch_vods_id) {
      vodlinkIds.push(participant.lol_match_twitch_vods_id);
    }
  }

  const vodLinks = await lolMatchTwitchVods.getByIds(vodlinkIds);
  const vodIds = vodLinks.map((vodLink) => vodLink.twitch_vod_id);
  const vods = await twitchVods.getByIds(vodIds);
  const channelIds = vods.map((vod) => vod.twitch_channel_id);
  const channels = await twitchAccounts.getByIds(channelIds);

  const matchData = mapMatchData(
    lolMatches,
    participants,
    vodLinks,
    vods,
    channels
  );

  return {
    data: matchData,
    pagination,
    counts,
  };
}

function mapMatchData(lolMatches, participants, vodLinks, vods, channels) {
  return lolMatches.map((lolMatch) => {
    const matchParticipants = participants.filter(
      (participant) => participant.lol_match_id === lolMatch.id
    );
    lolMatch.participants = matchParticipants.map((participant) => {
      const vodlinkId = participant.lol_match_twitch_vods_id;
      if (!vodlinkId) {
        return participant;
      }

      participant.vodLink = vodLinks.find(
        (vodlink) => vodlink.id === vodlinkId
      );
      participant.vod = vods.find(
        (vod) => vod.id === participant.vodLink?.twitch_vod_id
      );
      participant.channel = channels.find(
        (channel) => channel.id === participant.vod?.twitch_channel_id
      );
      return participant;
    });

    return lolMatch;
  });
}

async function getRoleCounts(matchupInfo, joins, params, filters, wheres) {
  const counts = {};
  const streamerRoleName = `ALLY_${matchupInfo.ROLE}`;
  for (let role of roleNames) {
    const filterString = `${joinName(role)}.champion_id`;
    const queryWheres = wheres.filter(
      (string) => !string.includes(filterString)
    );

    if (role.includes("ALLY")) {
      let query = `
            SELECT
                ${joinName(role)}.champion_id AS champion_id,
                count(distinct(lm.id))::int
            FROM
                lol_matches lm
            ${joins.join("\n\t")}
            WHERE
                ${queryWheres.join("\n\tand ")}
            GROUP BY
                ${joinName(role)}.champion_id
        `;

      if (role === streamerRoleName) {
        counts[role] = await queries.manyOrNone(query, params);
      } else {
        if (filters.ally.includes(role)) {
          counts[role] = await queries.manyOrNone(query, params);
        } else {
          const queryJoins = [...joins];
          const queryParams = { ...params };
          queryJoins.push(
            roleJoinString(
              joinName(role),
              getJoinType(streamerRoleName, filters, role)
            )
          );

          // if streamer role is included and only enemy champ
          const lastQuery = queryWheres[queryWheres.length - 1];
          const isVodlinkWhere = lastQuery.includes(
            "lol_match_twitch_vods_id IS NOT NULL"
          );
          if (isVodlinkWhere) {
            const baseString = `${lastQuery.slice(0, lastQuery.length - 2)}`;
            // baseString is ( CONDITION OR CONDITION
            queryWheres[queryWheres.length - 1] = `${baseString} OR ${joinName(
              role
            )}.lol_match_twitch_vods_id IS NOT NULL )`;
          }

          queryWheres.push(`${joinName(role)}.role = ${roleName(role)}`);
          query = `    
            SELECT
                ${joinName(role)}.champion_id AS champion_id,
                count(DISTINCT(lm.id))::int
            FROM
                lol_matches lm
            ${queryJoins.join("\n\t")}
            WHERE
                ${queryWheres.join("\n\tand ")}
            GROUP BY
                ${joinName(role)}.champion_id 
          `;

          counts[role] = await queries.manyOrNone(query, queryParams);
        }
      }
    } else {
      if (filters.enemy.includes(role)) {
        const query = `    
            SELECT
                ${joinName(role)}.champion_id AS champion_id,
                count(distinct(lm.id))::int
            FROM
                lol_matches lm
            ${joins.join("\n\t")}
            WHERE
                ${queryWheres.join("\n\tand ")}
            GROUP BY
                ${joinName(role)}.champion_id
          `;
        counts[role] = await queries.manyOrNone(query, params);
      } else {
        const queryJoins = [...joins];
        const queryParams = { ...params };

        if (filters.ally.length === 5) {
          queryJoins.push(
            roleJoinString(
              joinName(role),
              `!= ${joinName(filters.ally[0])}.team_id`
            )
          );
        } else {
          queryJoins.push(
            roleJoinString(
              joinName(role),
              getJoinType(streamerRoleName, filters, role)
            )
          );
        }

        queryWheres.push(`${joinName(role)}.role = ${roleName(role)}`);
        const query = `    
            SELECT
                ${joinName(role)}.champion_id AS champion_id,
                count(DISTINCT(lm.id))::int
            FROM
                lol_matches lm
            ${queryJoins.join("\n\t")}
            WHERE
                ${queryWheres.join("\n\tand ")}
            GROUP BY
                ${joinName(role)}.champion_id 
          `;

        counts[role] = await queries.manyOrNone(query, queryParams);
      }
    }
  }

  return counts;
}

function getMatchupBody(matchupInfo, params) {
  const matchupWheres = [];
  const matchupJoins = [];
  const streamerRoleName = `ALLY_${matchupInfo.ROLE}`;
  const hasRole = !!matchupInfo.ROLE;
  const champFilters = {
    total: 0,
    ally: [],
    enemy: [],
  };
  // populate champFilter data, record how many champIds and which are in use
  for (const roleName of roleNames) {
    const [team, _] = roleName.split("_");
    const championId = matchupInfo[roleName];
    if (championId) {
      champFilters.total++;
      if (team === "ALLY") {
        champFilters.ally.push(roleName);
      } else {
        champFilters.enemy.push(roleName);
      }
    }
  }

  // iterate through roles, adding joins and where filters where needed,
  // additionally sets up the params object with all needed info
  for (const roleName of roleNames) {
    const [team, role] = roleName.split("_");
    const isAlly = team === "ALLY";
    const championId = matchupInfo[roleName];
    const isStreamerRole = roleName === streamerRoleName;
    params[roleName] = {
      role,
      championId,
      joinName: roleName,
    };

    const initialWhereLength = matchupWheres.length;
    if (championId) {
      matchupWheres.push(
        `$[${roleName}.joinName~].champion_id = $[${roleName}.championId]`
      );
    }

    if (isStreamerRole) {
      matchupWheres.push(
        `$[${roleName}.joinName~].lol_match_twitch_vods_id IS NOT NULL`
      );
    }
    const addedJoin = initialWhereLength !== matchupWheres.length;

    if (addedJoin) {
      matchupWheres.push(`$[${roleName}.joinName~].role = $[${roleName}.role]`);
      const teamJoin = getJoinType(streamerRoleName, champFilters, roleName);
      matchupJoins.push(roleJoinString(joinName(roleName), teamJoin));
    }
  }

  if (!matchupInfo.ROLE) {
    // when no role is included, ensure a vodlink exists on the allies team
    const allyWheres = champFilters.ally.map(
      (role) => `${joinName(role)}.lol_match_twitch_vods_id IS NOT NULL`
    );
    if (champFilters.ally.length !== 5) {
      matchupJoins.unshift(roleJoinString("participant"));
      allyWheres.push("participant.lol_match_twitch_vods_id IS NOT NULL");
    }
    for (const searchedRole of champFilters.ally) {
      matchupWheres.push(`participant.role != ${roleName(searchedRole)}`);
    }
    matchupWheres.push(`( ${allyWheres.join("\n\tOR ")} )`);
  }

  return {
    wheres: matchupWheres,
    joins: matchupJoins,
    filters: champFilters,
  };
}

function getJoinType(streamerRoleName, champFilters, roleName) {
  const hasStreamerRole = streamerRoleName.length > 5;
  if (roleName === streamerRoleName) {
    // no need for team join, this join will be used for all other team joins
    return;
  }

  const joinType = roleName.includes("ALLY") ? "=" : "!=";
  if (hasStreamerRole) {
    return `${joinType} $[${streamerRoleName}.joinName~].team_id`;
  } else {
    if (champFilters.ally.length === 5) {
      // if 5 joins exist we dont have a participant role to join on
      // so instead use first join on the list for teamId comparison
      const allyBaseRole = champFilters.ally[0];
      if (allyBaseRole === roleName) {
        // we dont need to create a join, as this will be for comparison
        return;
      }

      return `${joinType} ${joinName(allyBaseRole)}.team_id`;
    } else {
      // we have a participant role joined that we can use for teamId comparison
      return `${joinType} participant.team_id`;
    }
  }
}

function joinName(roleName) {
  return `$[${roleName}.joinName~]`;
}

function roleName(roleName) {
  return `$[${roleName}.role]`;
}

function roleJoinString(joinName, teamIdString) {
  return `join lol_match_participants as ${joinName} on
                    ${joinName}.lol_match_id = lm.id
                    ${
                      teamIdString
                        ? `and ${joinName}.team_id ${teamIdString}`
                        : ""
                    }`;
}

module.exports = {
  matchupSearch,
};
