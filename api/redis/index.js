const RedisClient = require("./client");

const sixHours = 60 * 6;
const dbIndexes = {
  vodLink: 1,
  champCounts: 2,
};

const vodlinkRedis = new RedisClient(sixHours, dbIndexes.vodLink);
const champCountsRedis = new RedisClient(sixHours, dbIndexes.champCounts);

module.exports = {
  vodlinkRedis,
  champCountsRedis,
};
