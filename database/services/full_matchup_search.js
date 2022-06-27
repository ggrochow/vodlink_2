const db = require("../models/raw_queries");

let roleNames = [
  "ally_TOP",
  "ally_MIDDLE",
  "ally_BOTTOM",
  "ally_UTILITY",
  "ally_JUNGLE",
  "enemy_TOP",
  "enemy_MIDDLE",
  "enemy_BOTTOM",
  "enemy_UTILITY",
  "enemy_JUNGLE",
];

/**
 * Find VodLinks for up to a full matchup
 * @param matchupInfo Object with the all the above roleNames as keys.
 *                    roleNames may optionally have a championId as the value to be searched for
 *                    Object must also have a 'streamerRole' key, with the value being a role string for the desired role
 */
function matchupSearch(matchupInfo) {
  let matchupSelect = [];
  let matchupJoins = [];
  let matchupWheres = [];
  let params = {};

  let streamerRoleName = `ally_${matchupInfo.streamerRole}`;

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
      // Add all Non-streamer roles as participants
      let teamJoinType = team === "ally" ? "=" : "!=";

      matchupSelect.push(
        `$[${roleName}.joinName~].champion_id as ${roleName}_champion`,
        `$[${roleName}.joinName~].summoner_name as ${roleName}_summoner_name`,
        `$[${roleName}.joinName~].rank_tier as ${roleName}_rank_tier`,
        `$[${roleName}.joinName~].rank_rank as ${roleName}_rank_rank`,
        `$[${roleName}.joinName~].rank_lp as ${roleName}_rank_lp`,
        `$[${roleName}.joinName~].mastery_level as ${roleName}_mastery_level`,
        `$[${roleName}.joinName~].mastery_points as ${roleName}_mastery_points`,
        `$[${roleName}.joinName~].rune_1 as ${roleName}_rune_1`,
        `$[${roleName}.joinName~].rune_2 as ${roleName}_rune_2`,
        `$[${roleName}.joinName~].rune_3 as ${roleName}_rune_3`,
        `$[${roleName}.joinName~].rune_4 as ${roleName}_rune_4`,
        `$[${roleName}.joinName~].rune_5 as ${roleName}_rune_5`,
        `$[${roleName}.joinName~].rune_6 as ${roleName}_rune_6`
      );
      matchupJoins.push(
        `join lol_match_participants as $[${roleName}.joinName~] on
                    $[${roleName}.joinName~].lol_match_id = match.id
                    and $[${roleName}.joinName~].team_id ${teamJoinType} participant.team_id`
      );
      matchupWheres.push(`$[${roleName}.joinName~].role = $[${roleName}.role]`);
      if (championId) {
        matchupWheres.push(
          `$[${roleName}.joinName~].champion_id = $[${roleName}.championId]`
        );
      }
    } else {
      // streamer role has extra joins so it needs special treatment.
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
    select 
        relation.id as id,
        vod.native_vod_id as vod_id,
        match.started_at as match_timestamp,
        match.region as match_region,
        match.native_match_id as native_match_id,
        relation.vod_timestamp as vod_offset_seconds,
        match.native_match_id as native_match_id,
        channel.channel_name as streamer_name,
        summoner.summoner_name as summoner_name,
        summoner.region as region,
        participant.champion_id as streamer_champion,
        participant.rank_tier as streamer_rank_tier,
        participant.rank_rank as streamer_rank_rank,
        participant.rank_lp as streamer_rank_lp,
        participant.mastery_level as streamer_mastery_level,
        participant.mastery_points as streamer_mastery_points,
        participant.rune_1 as streamer_rune_1,
        participant.rune_2 as streamer_rune_2,
        participant.rune_3 as streamer_rune_3,
        participant.rune_4 as streamer_rune_4,
        participant.rune_5 as streamer_rune_5,
        participant.rune_6 as streamer_rune_6,
        ${matchupSelect.join(",\n")}
    from 
        lol_match_twitch_vods as relation
    join lol_matches as match on
        match.id = relation.lol_match_id
    join lol_match_participants as participant on
        match.id = participant.lol_match_id
    join lol_summoners as summoner on
        participant.native_summoner_id = summoner.native_summoner_id
    join twitch_channels as channel on
        channel.id = summoner.twitch_channel_id
    join twitch_vods as vod on
        vod.id = relation.twitch_vod_id
        and vod.twitch_channel_id = channel.id
     ${matchupJoins.join("\n")}
     where
        ${matchupWheres.join("\n\tand ")}
     order by relation.id DESC`;

  return db.manyOrNone(query, params);
}

module.exports = {
  matchupSearch,
};
