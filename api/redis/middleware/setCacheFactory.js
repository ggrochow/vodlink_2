const logger = require("../../../utils/logger");

function setCacheFactory(redisClient, keyExtractor, hasNext = false) {
  return async (req, res, next) => {
    const key = keyExtractor(req);
    const result = res?.locals?.results;

    try {
      if (result) {
        logger.debug(`setRedis setting ${key}`);
        await redisClient.set(key, result);
      } else {
        logger.debug("no result to set");
      }
    } catch (redisError) {
      logger.error(`setRedis error ${redisError.message}`);
      console.error(redisError);
      return res.sendStatus(500);
    }

    if (hasNext) {
      next();
    }
  };
}

module.exports = setCacheFactory;
