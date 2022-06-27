const express = require("express");
const router = express.Router();

const {
  matchupSearch,
} = require("../../../database/services/full_matchup_search");
const { getFactory } = require("../controller_factories");
router.get("/matchupSearch", getFactory(matchupSearch));

module.exports = router;
