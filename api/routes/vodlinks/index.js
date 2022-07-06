const express = require("express");
const router = express.Router();

const {
  matchupSearch,
} = require("../../../database/services/full_matchup_search");
const { getFactory } = require("../controller_factories");
const { validateQueryFactory } = require("../../schemas/middleware_factories");
const { fullMatchupSearchSchema } = require("../../schemas/matchupSearch");

router.get(
  "/matchupSearch",
  validateQueryFactory(fullMatchupSearchSchema),
  getFactory(matchupSearch)
);

module.exports = router;
