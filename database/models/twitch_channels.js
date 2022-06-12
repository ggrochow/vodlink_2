const db = require("./raw_queries");

function createNew(twitchUserName, nativeTwitchId) {
  let query = `
    INSERT INTO twitch_channels(native_channel_id, channel_name) VALUES($1, $2)
    ON CONFLICT ON CONSTRAINT twitch_channels_native_channel_id_key
    DO UPDATE SET channel_name = EXCLUDED.channel_name
    RETURNING *
   `;
  let params = [nativeTwitchId, twitchUserName];

  return db.one(query, params);
}

function getById(id) {
  let query = "SELECT * FROM twitch_channels WHERE id = $1";
  let params = [id];

  return db.one(query, params);
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
  getByNativeSummonerIds,
  getAll,
};
