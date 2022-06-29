const express = require("express");
const router = express.Router();

const counts = require("./counts");
const channels = require("./channels");
const vodlinks = require("./vodlinks");

router.use("/counts", counts);
router.use("/channels", channels);
router.use("/vodlinks", vodlinks);

module.exports = router;
