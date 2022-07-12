const express = require("express");
const router = express.Router();

const { championCountSchema } = require("../../schemas/counts");
const { getResultsFactory } = require("../controller_factories");
const {
  vodlinkChampionCounts,
} = require("../../../database/services/matchupSearch/vodlink_counts");
const { queryParamsExtractor } = require("../../middleware/extractors");
const {
  setCacheFactory,
  getCacheFactory,
  validateQueryFactory,
} = require("../../middleware");
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
