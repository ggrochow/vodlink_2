const express = require("express");
const router = express.Router();

const counts = require("./counts");
const channels = require("./channels");
const vodlinks = require("./vodlinks");
const { requireAuthHeader, requireAdminAuthHeader } = require("../middleware");

router.use("/counts", requireAuthHeader, counts);
router.use("/channels", requireAdminAuthHeader, channels);
router.use("/vodlinks", requireAuthHeader, vodlinks);

module.exports = router;
