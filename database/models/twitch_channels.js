const db = require("./raw_queries");

function createNew(twitchUserName, twitchDisplayName, nativeTwitchId) {
  let query = `
    INSERT INTO 
        twitch_channels 
        (native_channel_id, channel_name, display_name) 
        VALUES ( $(nativeTwitchId), $(twitchUserName), $(twitchDisplayName) )
    RETURNING *
   `;
  let params = {
    nativeTwitchId,
    twitchDisplayName,
    twitchUserName,
  };

  return db.one(query, params);
}

function getById(id) {
  let query = "SELECT * FROM twitch_channels WHERE id = $1";
  let params = [id];

  return db.one(query, params);
}

function getByIds(ids) {
  if (!ids || ids.length === 0) {
    return [];
  }

  let query = "SELECT * FROM twitch_channels WHERE id IN ( $(ids:list) )";
  let params = { ids };

  return db.manyOrNone(query, params);
}

function getByNativeId(nativeId) {
  const query = `SELECT * FROM twitch_channels WHERE native_channel_id = $(nativeId)`;
  const params = { nativeId };

  return db.oneOrNone(query, params);
}

function getByNativeSummonerIds(nativeSummonerIds) {
  const query = `
    SELECT * FROM twitch_channels 
    WHERE id in (
        SELECT twitch_channel_id from lol_summoners WHERE native_summoner_id IN ($(nativeSummonerIds:list))
    )
   `;
  const params = {
    nativeSummonerIds,
  };

  return db.manyOrNone(query, params);
}

function getAll() {
  let query = "SELECT * FROM twitch_channels";

  return db.manyOrNone(query);
}

module.exports = {
  createNew,
  getById,
  getByIds,
  getByNativeId,
  getByNativeSummonerIds,
  getAll,
};
