const db = require("./models/raw_queries");

function vodlinkChampionCounts({ role }) {
  const query = `
    select
        champion_id,
        COUNT(lmp.id)::int
    from
        lol_match_participants lmp
    join lol_matches lm on
        lmp.lol_match_id = lm.id
    join lol_summoners ls on
        lmp.native_summoner_id = ls.native_summoner_id
        and ls.region = lm.region
    join lol_match_twitch_vods lmtv on
        lmtv.lol_match_id = lm.id
    join twitch_vods tv on
        tv.id = lmtv.twitch_vod_id
    join twitch_channels tc on
        tc.id = tv.twitch_channel_id
        and ls.twitch_channel_id = tc.id
    ${role ? "where lmp.role = $(role)" : ""}
    group by
        lmp.champion_id;
  `;

  const params = {
    role,
  };

  return db.manyOrNone(query, params);
}

function vodlinkRoleCounts({ championId }) {
  const query = `
    select
        lmp.role,
        COUNT(lmp.id)::int
    from
        lol_match_participants lmp
    join lol_matches lm on
        lmp.lol_match_id = lm.id
    join lol_summoners ls on
        lmp.native_summoner_id = ls.native_summoner_id
        and ls.region = lm.region
    join lol_match_twitch_vods lmtv on
        lmtv.lol_match_id = lm.id
    join twitch_vods tv on
        tv.id = lmtv.twitch_vod_id
    join twitch_channels tc on
        tc.id = tv.twitch_channel_id
        and ls.twitch_channel_id = tc.id
${championId ? "where lmp.champion_id = $(championId)" : ""}
    group by
        lmp.role
 `;

  const params = {
    championId,
  };

  return db.manyOrNone(query, params);
}

function vodlinkEnemyChampionCounts({ role, championId }) {
  const where = [];
  const params = {};
  if (role) {
    params.role = role;
    where.push("lmp2.role = $(role)");
  }
  if (championId) {
    params.championId = championId;
    where.push("lmp2.champion_id = $(championId)");
  }
  const query = `
  select
    lmp.champion_id,
    COUNT(lmp.id)::int
  from
    lol_match_participants lmp
  join lol_matches lm on
    lmp.lol_match_id = lm.id
  join lol_match_participants lmp2 on
    lmp2.lol_match_id = lmp.lol_match_id
    and lmp2.role = lmp.role
    and lmp2.team_id != lmp.team_id
  join lol_summoners ls on
    lmp2.native_summoner_id = ls.native_summoner_id
    and ls.region = lm.region
  join lol_match_twitch_vods lmtv on
    lmtv.lol_match_id = lm.id
  join twitch_vods tv on
    tv.id = lmtv.twitch_vod_id
  join twitch_channels tc on
    tc.id = tv.twitch_channel_id
    and ls.twitch_channel_id = tc.id
  ${where.length > 0 ? "where " : ""}
  ${where.join(" and ")}
  group by
    lmp.champion_id
  `;

  return db.manyOrNone(query, params);
}

module.exports = {
  vodlinkRoleCounts,
  vodlinkChampionCounts,
  vodlinkEnemyChampionCounts,
};
