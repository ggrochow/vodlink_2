const db = require("./raw_queries");

function createNew(
  matchId,
  teamId,
  championId,
  summonerName,
  role,
  nativeSummonerId,
  nativePuuid
) {
  const query = `
    INSERT INTO lol_match_participants
    (lol_match_id, team_id, champion_id, summoner_name, role, native_summoner_id, native_puuid)
    VALUES ( $(matchId), $(teamId), $(championId), $(summonerName), $(role), $(nativeSummonerId), $(nativePuuid) ) 
    RETURNING *
  `;
  const params = {
    matchId,
    teamId,
    championId,
    summonerName,
    nativePuuid,
    nativeSummonerId,
    role,
  };

  return db.one(query, params);
}

function getByMatchId(matchId) {
  let query = "SELECT * FROM lol_match_participants WHERE lol_match_id = $1";
  let params = [matchId];

  return db.manyOrNone(query, params);
}

function getById(id) {
  const query = `
    SELECT 
        * 
    FROM 
        lol_match_participants 
    WHERE 
        id = $(id)
  `;
  const params = {
    id,
  };

  return db.oneOrNone(query, params);
}

function deleteByLolMatchIds(ids) {
  let query =
    "DELETE FROM lol_match_participants WHERE lol_match_id IN ( $1:list )";
  let params = [ids];

  return db.none(query, params);
}

function setRankById(tier, rank, lp, id) {
  const query = `
    UPDATE 
      lol_match_participants
    SET 
        rank_tier = $(tier),
        rank_rank = $(rank),
        rank_lp   = $(lp)
    WHERE 
        id = $(id)
    RETURNING *;
  `;
  const params = {
    tier,
    rank,
    lp,
    id,
  };

  return db.one(query, params);
}

function setMasteryById(level, points, id) {
  const query = `
    UPDATE 
      lol_match_participants
    SET 
        mastery_level = $(level),
        mastery_points = $(points)
    WHERE 
        id = $(id)
    RETURNING *;
  `;
  const params = {
    level,
    points,
    id,
  };

  return db.one(query, params);
}

module.exports = {
  createNew,
  getByMatchId,
  getById,
  setRankById,
  setMasteryById,
  deleteByLolMatchIds,
};
