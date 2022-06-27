const express = require("express");
const router = express.Router();

const counts = require("./counts");
const channels = require("./channels");
const vodlikns = require("./vodlinks");

router.use("/counts", counts);
router.use("/channels", channels);
router.use("/vodlinks", vodlikns);

module.exports = router;
