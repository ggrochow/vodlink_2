const db = require("./raw_queries");

function createNew(startedAt, endedAt, twitchChannelId, nativeVodId) {
  let query =
    "" +
    "INSERT INTO twitch_vods " +
    "(started_at, ended_at, twitch_channel_id, native_vod_id) " +
    "VALUES ($1, $2, $3, $4) RETURNING *";

  let params = [startedAt, endedAt, twitchChannelId, nativeVodId];

  return db.one(query, params);
}

function getById(id) {
  let query = "SELECT * FROM twitch_vods WHERE id = $1";
  let params = [id];

  return db.oneOrNone(query, params);
}

function getAllNativeVodIdsByTwitchChannelId(twitchChannelId) {
  let query =
    "SELECT native_vod_id FROM twitch_vods WHERE twitch_channel_id = $1";
  let params = [twitchChannelId];

  return db.manyOrNone(query, params);
}

function findVodPlayedDuringPeriodByAccount(
  startTime,
  endTime,
  twitchAccountId
) {
  let query =
    "" +
    "SELECT * FROM twitch_vods WHERE started_at < $1 AND ended_at > $2 AND twitch_channel_id = $3";
  let params = [startTime, endTime, twitchAccountId];

  return db.oneOrNone(query, params);
}

function deleteById(id) {
  let query = "DELETE FROM twitch_vods WHERE id = $1";
  let params = [id];

  return db.none(query, params);
}

function getAll() {
  let query = "SELECT * FROM twitch_vods";

  return db.manyOrNone(query);
}

module.exports = {
  createNew,
  getById,
  getAllNativeVodIdsByTwitchChannelId,
  findVodPlayedDuringPeriodByAccount,
  deleteById,
  getAll,
};
