const db = require("./raw_queries");

function createNew({
  matchId,
  teamId,
  championId,
  summonerName,
  role,
  nativeSummonerId,
  nativePuuid,
  rune1,
  rune2,
  rune3,
  rune4,
  rune5,
  rune6,
}) {
  const query = `
    INSERT INTO lol_match_participants
    (lol_match_id, team_id, champion_id, summoner_name, role, native_summoner_id, native_puuid, rune_1, rune_2, rune_3, rune_4, rune_5, rune_6)
    VALUES ( $(matchId), $(teamId), $(championId), $(summonerName), $(role), $(nativeSummonerId), $(nativePuuid), $(rune1), $(rune2), $(rune3), $(rune4), $(rune5), $(rune6) ) 
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
    rune1,
    rune2,
    rune3,
    rune4,
    rune5,
    rune6,
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

function setVodlinkById(vodlinkId, id) {
  const query = `
    update
      lol_match_participants
    SET
      lol_match_twitch_vods_id = $(vodlinkId)
    WHERE
        id = $(id)
    RETURNING *;
  `;
  const params = { vodlinkId, id };
  return db.one(query, params);
}

module.exports = {
  createNew,
  getByMatchId,
  getById,
  setRankById,
  setVodlinkById,
  setMasteryById,
  deleteByLolMatchIds,
};
