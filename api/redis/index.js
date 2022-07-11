const RedisClient = require("./client");

const fourHours = 60 * 4;
const dbIndexes = {
  vodLink: 1,
  champCounts: 2,
};

const vodlinkRedis = new RedisClient(fourHours, dbIndexes.vodLink);
const champCountsRedis = new RedisClient(fourHours, dbIndexes.champCounts);

module.exports = {
  vodlinkRedis,
  champCountsRedis,
};
