const { createClient } = require("async-redis");
const logger = require("../../utils/logger");

class RedisClient {
  constructor(cacheTime, db) {
    this.host = process.env.REDIS_HOST;
    this.port = process.env.REDIS_PORT;
    this.password = process.env.REDIS_PASSWORD;
    this.db = db;
    this.cacheTime = cacheTime;
  }

  async get(key) {
    const redis = await this.redisConnect();
    return redis.get(key);
  }

  async set(key, value) {
    const redis = await this.redisConnect();
    await redis.set(key, JSON.stringify(value), "EX", 60 * this.cacheTime);
  }

  async del(key) {
    const redis = await this.redisConnect();
    await redis.del(key);
  }

  async flushAll() {
    const redis = await this.redisConnect();
    await redis.flushdb();
  }

  async redisConnect() {
    if (this?.client?.__redisClient?.connected) {
      return this.client;
    }

    const redisConfig = {
      host: this.host,
      port: this.port,
      password: this.password,
      prefix: this.prefix,
      db: this.db,
    };

    const client = await createClient(redisConfig);
    client.on("error", (err) => logger.error(`Redis client Error: ${err}`));

    this.client = client;
    return client;
  }
}

module.exports = RedisClient;
