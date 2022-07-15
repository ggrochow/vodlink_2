const express = require("express");
const router = express.Router();

const counts = require("./counts");
const admin = require("./admin");
const vodlinks = require("./vodlinks");
const { requireAuthHeader, requireAdminAuthHeader } = require("../middleware");

router.use("/admin", requireAdminAuthHeader, admin);
router.use("/counts", requireAuthHeader, counts);
router.use("/vodlinks", requireAuthHeader, vodlinks);

module.exports = router;
