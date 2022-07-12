const express = require("express");
const router = express.Router();

const {
  matchupSearch,
} = require("../../../database/services/matchupSearch/full_matchup_search");
const { getResultsFactory } = require("../controller_factories");
const { fullMatchupSearchSchema } = require("../../schemas/matchupSearch");
const {
  setCacheFactory,
  validateQueryFactory,
  getCacheFactory,
} = require("../../middleware");
const { vodlinkRedis } = require("../../redis");
const { queryParamsExtractor } = require("../../middleware/extractors");

router.get(
  "/matchupSearch",
  validateQueryFactory(fullMatchupSearchSchema),
  getCacheFactory(vodlinkRedis, queryParamsExtractor),
  getResultsFactory(matchupSearch),
  setCacheFactory(vodlinkRedis, queryParamsExtractor)
);

module.exports = router;
