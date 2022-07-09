const db = require("./raw_queries");

function createNewLolSummoner(
  nativeSummonerId,
  nativePuuid,
  summonerName,
  region,
  twitchChannelId
) {
  const query = `
    INSERT INTO lol_summoners
            (native_summoner_id, native_puuid, summoner_name, region, twitch_channel_id) 
    VALUES  ($(nativeSummonerId), $(nativePuuid), $(summonerName), $(region), $(twitchChannelId))
    RETURNING *
  `;
  const params = {
    nativeSummonerId,
    nativePuuid,
    summonerName,
    region,
    twitchChannelId,
  };

  return db.one(query, params);
}

function getAllByTwitchId(twitchId) {
  let query = "SELECT * FROM lol_summoners WHERE twitch_channel_id = $1";
  let params = [twitchId];

  return db.manyOrNone(query, params);
}

function getAllByTwitchIds(twitchIds) {
  const query = `
    SELECT 
        *
    FROM
        lol_summoners
    WHERE
        twitch_channel_id IN $(twitchIds:list)
  `;
  const params = { twitchIds };

  return db.manyOrNone(query, params);
}

function updateSummonerName(id, summonerName) {
  const query = `
  UPDATE
    lol_summoners
  SET
    summoner_name = $(summonerName)
  WHERE
    id = $(id)
  RETURNING *
  `;
  const params = { id, summonerName };

  return db.one(query, params);
}

function getAll() {
  return db.manyOrNone(`SELECT * FROM lol_summoners`);
}

function getById(id) {
  let query = "SELECT * FROM lol_summoners WHERE id = $1";
  let params = [id];

  return db.oneOrNone(query, params);
}

module.exports = {
  createNewLolSummoner,
  getAllByTwitchId,
  getAllByTwitchIds,
  updateSummonerName,
  getAll,
  getById,
};
