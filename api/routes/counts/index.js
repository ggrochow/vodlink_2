const express = require("express");
const router = express.Router();

const { validateQueryFactory } = require("../../schemas/middleware_factories");
const {
  roleCountSchema,
  championCountSchema,
  enemyChampionCountSchema,
} = require("../../schemas/counts");
const { getFactory } = require("../controller_factories");
const {
  vodlinkRoleCounts,
  vodlinkChampionCounts,
  vodlinkEnemyChampionCounts,
} = require("../../../database/services/vodlink_counts");
router.get(
  "/roleCounts",
  validateQueryFactory(roleCountSchema),
  getFactory(vodlinkRoleCounts)
);
router.get(
  "/champCounts",
  validateQueryFactory(championCountSchema),
  getFactory(vodlinkChampionCounts)
);
router.get(
  "/enemyChampCounts",
  validateQueryFactory(enemyChampionCountSchema),
  getFactory(vodlinkEnemyChampionCounts)
);

module.exports = router;
