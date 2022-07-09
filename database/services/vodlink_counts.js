const db = require("../models/raw_queries");

function vodlinkChampionCounts({ role }) {
  const query = `
    select
        champion_id,
        count(*)::int
    from
        lol_match_participants lmp
    where
        lol_match_twitch_vods_id is not null
        ${role ? "and lmp.role = $(role)" : ""}
    group by
        champion_id ;
  `;

  const params = {
    role,
  };

  return db.manyOrNone(query, params);
}

function vodlinkRoleCounts({ championId }) {
  const query = `
    select
        role,
        count(*)::int
    from
        lol_match_participants lmp
    where
        lol_match_twitch_vods_id is not null
        ${championId ? "and lmp.champion_id = $(championId)" : ""}
    group by
        role;
  `;

  const params = {
    championId,
  };

  return db.manyOrNone(query, params);
}

function vodlinkEnemyChampionCounts({ role, championId }) {
  const query = `
    select
        opponent.champion_id,
        count(opponent.*)::int
    from
        lol_match_participants as opponent
        join lol_match_participants streamer on
            streamer.lol_match_id = opponent.lol_match_id 
            and streamer.role = opponent.role
            and streamer.team_id != opponent.team_id
    where
        streamer.lol_match_twitch_vods_id is not null
        ${championId ? "and streamer.champion_id = $(championId)" : ""}
        ${role ? "and streamer.role = $(role)" : ""}
    group by
        opponent.champion_id; 
  `;
  const params = { role, championId };

  return db.manyOrNone(query, params);
}

module.exports = {
  vodlinkRoleCounts,
  vodlinkChampionCounts,
  vodlinkEnemyChampionCounts,
};
