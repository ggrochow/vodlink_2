const db = require("./raw_queries");

function getByRegionAndNativeId(region, nativeMatchId) {
  let query =
    "SELECT * FROM lol_matches WHERE UPPER(region) = $1 AND native_match_id = $2";
  let params = [region, nativeMatchId];

  return db.oneOrNone(query, params);
}

function getById(id) {
  let query = "SELECT * FROM lol_matches WHERE id = $1;";
  let params = [id];

  return db.oneOrNone(query, params);
}

function createNew(nativeMatchId, winningTeam, startedAt, endedAt, region) {
  let query =
    "" +
    "INSERT INTO lol_matches " +
    "(native_match_id, winning_team, started_at, ended_at, region) " +
    "VALUES ($1, $2, $3, $4, $5) RETURNING *";
  let params = [nativeMatchId, winningTeam, startedAt, endedAt, region];

  return db.one(query, params);
}

function getLolMatchIdsOlderThanTwoMonths() {
  let query = `select id from lol_matches where started_at < (NOW() - interval '2 month')`;

  return db.manyOrNone(query);
}

function deleteByIds(ids) {
  let query = `DELETE FROM lol_matches WHERE id IN ( $1:list )`;
  let params = [ids];

  return db.none(query, params);
}

function getMostRecentLolMatchWithFullData() {
  const query = `
    select
        lm.*
    from
        lol_matches lm
    join lol_match_participants lmp on
        lmp.lol_match_id = lm.id
    where
        lmp.rank_tier is not null
        and lmp.rank_rank is not null
        and lmp.rank_lp is not null
        and lmp.mastery_level is not null
        and lmp.mastery_points is not null
    group by
        lm.id
    having 
        count(lmp.*) = 10
    order by
        id desc
    limit 1; 
  `;

  return db.oneOrNone(query);
}

function getMatchWithMostVods() {
  const query = `
    select
        lm.*
    from
        lol_matches lm
    join lol_match_participants lmp on
        lmp.lol_match_id = lm.id
    where
        lmp.lol_match_twitch_vods_id IS NOT NULL
    group by
        lm.id
    order by 
        count(lmp.*) desc
    limit 
        1
  `;

  return db.oneOrNone(query);
}

module.exports = {
  getById,
  getByRegionAndNativeId,
  createNew,
  getLolMatchIdsOlderThanTwoMonths,
  getMostRecentLolMatchWithFullData,
  getMatchWithMostVods,
  deleteByIds,
};
