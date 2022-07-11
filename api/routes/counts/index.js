const express = require("express");
const router = express.Router();

const { validateQueryFactory } = require("../../schemas/middleware_factories");
const { championCountSchema } = require("../../schemas/counts");
const { getFactory } = require("../controller_factories");
const {
  vodlinkChampionCounts,
} = require("../../../database/services/matchupSearch/vodlink_counts");

router.get(
  "/champCounts",
  validateQueryFactory(championCountSchema),
  getFactory(vodlinkChampionCounts)
);

module.exports = router;
