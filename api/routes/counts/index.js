const express = require("express");
const router = express.Router();

const { validateQueryFactory } = require("../../schemas/middleware_factories");
const { championCountSchema } = require("../../schemas/counts");
const { getResultsFactory } = require("../controller_factories");
const {
  vodlinkChampionCounts,
} = require("../../../database/services/matchupSearch/vodlink_counts");
const { queryParamsExtractor } = require("../../redis/extractors");
const { setCacheFactory, getCacheFactory } = require("../../redis/middleware");
const { champCountsRedis } = require("../../redis");

const getCache = getCacheFactory(champCountsRedis, queryParamsExtractor);
const setCache = setCacheFactory(champCountsRedis, queryParamsExtractor);

router.get(
  "/champCounts",
  validateQueryFactory(championCountSchema),
  getCache,
  getResultsFactory(vodlinkChampionCounts),
  setCache
);

module.exports = router;
