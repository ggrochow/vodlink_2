const {
  settings,
  lolMatchTwitchVods,
  twitchVods,
  twitchAccounts,
  lolMatchParticipant,
} = require("../../models");
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
 * @param matchupInfo
 * @returns {Promise<{joins: *[], wheres: *[], filters: {total: number, ally: *[], enemy: *[]}}>}
 */
async function getMatchupBody(matchupInfo) {
  const params = {};
  const matchupWheres = [];
  const matchupJoins = [];
  const streamerRoleName = `ALLY_${matchupInfo.ROLE}`;
  const champFilters = {
    total: 0,
    ally: [],
    enemy: [],
  };

  const cursor = await settings.getVodlinkPaginationCursor();
  if (cursor) {
    matchupWheres.push(`lm.id < $(cursor)`);
    params.cursor = Number(cursor.setting_value);
  }

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
    const [_, role] = roleName.split("_");
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
      const joinString = roleJoinString(joinName(roleName), teamJoin);
      if (isStreamerRole) {
        matchupJoins.unshift(joinString);
      } else {
        matchupJoins.push(joinString);
      }
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
    params,
  };
}

function getJoinType(streamerRoleName, champFilters, roleName) {
  const hasStreamerRole = !streamerRoleName.includes("undefined");
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

async function getVodlinkDataByMatchIds(lolMatchIds) {
  const participants = await lolMatchParticipant.getByMatchIds(lolMatchIds);

  const vodlinkIds = [];
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

  return { participants, vodLinks, vods, channels };
}

module.exports = {
  roleJoinString,
  roleName,
  joinName,
  getJoinType,
  getMatchupBody,
  mapMatchData,
  getVodlinkDataByMatchIds,
  roleNames,
};
