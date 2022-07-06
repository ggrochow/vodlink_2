const queries = require("../models/raw_queries");
const {
  lolMatchParticipant,
  lolMatchTwitchVods,
  twitchVods,
  twitchAccounts,
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
  let matchupJoins = [];
  let matchupWheres = [];
  let params = {
    page: matchupInfo.PAGE,
    limit: vodsPerPage,
    offset: (matchupInfo.PAGE - 1) * vodsPerPage,
  };

  let streamerRoleName = `ALLY_${matchupInfo.ROLE}`;

  for (let index in roleNames) {
    let roleName = roleNames[index];
    let [team, role] = roleName.split("_");
    let championId = matchupInfo[roleName];
    params[roleName] = {
      role,
      championId,
      joinName: roleName,
    };

    if (streamerRoleName !== roleName) {
      // If a champion filter is included for this role, add a join and where filters for it
      if (championId) {
        let teamJoinType = team === "ALLY" ? "=" : "!=";
        matchupJoins.push(
          `join lol_match_participants as $[${roleName}.joinName~] on
                    $[${roleName}.joinName~].lol_match_id = lm.id
                    and $[${roleName}.joinName~].team_id ${teamJoinType} participant.team_id`
        );
        matchupWheres.push(
          `$[${roleName}.joinName~].role = $[${roleName}.role]`,
          `$[${roleName}.joinName~].champion_id = $[${roleName}.championId]`
        );
      }
    } else if (matchupInfo.ROLE) {
      // streamer role has extra joins, so it needs special treatment.
      params.participant = {
        role,
        championId,
      };

      matchupWheres.push(`participant.role = $[participant.role]`);
      if (championId) {
        matchupWheres.push(
          `participant.champion_id = $[participant.championId]`
        );
      }
    }
  }

  let query = `
     SELECT 
        lm.*,
        participant.lol_match_twitch_vods_id as vodlink_id
     FROM 
        lol_matches lm
     JOIN 
        lol_match_participants participant 
            ON  participant.lol_match_id = lm.id 
            AND participant.lol_match_twitch_vods_id is not null
     ${matchupJoins.join("\n")}
     ${matchupWheres.length > 0 ? "WHERE" : ""}
        ${matchupWheres.join("\n\tand ")}
     ORDER by lm.id DESC
     LIMIT $(limit) OFFSET $(offset)
     `;

  const lolMatches = await queries.manyOrNone(query, params);
  const lolMatchIds = [];
  const vodlinkIds = [];

  lolMatches.forEach((match) => {
    lolMatchIds.push(match.id);
    vodlinkIds.push(match.vodlink_id);
  });

  const participants = await lolMatchParticipant.getByMatchIds(lolMatchIds);
  const vodLinks = await lolMatchTwitchVods.getByIds(vodlinkIds);
  const vodIds = vodLinks.map((vodLink) => vodLink.twitch_vod_id);
  const vods = await twitchVods.getByIds(vodIds);
  const channelIds = vods.map((vod) => vod.twitch_channel_id);
  const channels = await twitchAccounts.getByIds(channelIds);

  return lolMatches.map((lolMatch) => {
    lolMatch.participants = participants.filter(
      (participant) => participant.lol_match_id === lolMatch.id
    );
    lolMatch.vodLinks = vodLinks.filter(
      (vodlink) => vodlink.lol_match_id === lolMatch.id
    );
    lolMatch.vods = vods.filter((vod) => {
      const vodIds = lolMatch.vodLinks.map((vl) => vl.twitch_vod_id);
      return vodIds.includes(vod.id);
    });
    lolMatch.channels = channels.filter((channel) => {
      const channelIds = lolMatch.vods.map((vod) => vod.twitch_channel_id);
      return channelIds.includes(channel.id);
    });

    return lolMatch;
  });
}

module.exports = {
  matchupSearch,
};
