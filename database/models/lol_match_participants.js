const db = require("./raw_queries");

function createNew(
  matchId,
  teamId,
  championId,
  summonerName,
  nativeSummonerId,
  role
) {
  let query =
    "" +
    "INSERT INTO lol_match_participants " +
    "(lol_match_id, team_id, champion_id, summoner_name, native_summoner_id, role) " +
    "VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
  let params = [
    matchId,
    teamId,
    championId,
    summonerName,
    nativeSummonerId,
    role,
  ];

  return db.one(query, params);
}

function getByMatchId(matchId) {
  let query = "SELECT * FROM lol_match_participants WHERE lol_match_id = $1";
  let params = [matchId];

  return db.manyOrNone(query, params);
}

function deleteByLolMatchIds(ids) {
  let query =
    "DELETE FROM lol_match_participants WHERE lol_match_id IN ( $1:list )";
  let params = [ids];

  return db.none(query, params);
}

module.exports = {
  createNew,
  getByMatchId,
  deleteByLolMatchIds,
};
