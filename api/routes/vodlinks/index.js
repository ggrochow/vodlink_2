const express = require("express");
const router = express.Router();

const {
  matchupSearch,
} = require("../../../database/services/matchupSearch/full_matchup_search");
const { getFactory } = require("../controller_factories");
const { validateQueryFactory } = require("../../schemas/middleware_factories");
const { fullMatchupSearchSchema } = require("../../schemas/matchupSearch");
const { getCacheFactory, setCacheFactory } = require("../../redis/middleware");
const { vodlinkRedis } = require("../../redis");
const { queryParamsExtractor } = require("../../redis/extractors");

const getCache = getCacheFactory(vodlinkRedis, queryParamsExtractor);
const setCache = setCacheFactory(vodlinkRedis, queryParamsExtractor);

router.get(
  "/matchupSearch",
  validateQueryFactory(fullMatchupSearchSchema),
  getCache,
  getFactory(matchupSearch),
  setCache
);

module.exports = router;
