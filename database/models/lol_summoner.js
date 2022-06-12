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

function getById(id) {
  let query = "SELECT * FROM lol_summoners WHERE id = $1";
  let params = [id];

  return db.oneOrNone(query, params);
}

module.exports = {
  createNewLolSummoner,
  getAllByTwitchId,
  getById,
};
