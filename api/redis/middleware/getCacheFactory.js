const logger = require("../../../utils/logger");

function getCacheFactory(redisClient, keyExtractor) {
  return async (req, res, next) => {
    const key = keyExtractor(req);

    try {
      const result = await redisClient.get(key);

      if (result) {
        logger.debug(`getRedis found  ${key}`);
        return res.status(200).send(result);
      } else {
        logger.debug(`getRedis missed ${key}`);
        return next();
      }
    } catch (redisError) {
      logger.error(`getRedis error ${redisError.message}`);
      console.error(redisError);
      return res.sendStatus(500);
    }
  };
}

module.exports = getCacheFactory;
