const express = require("express");
const router = express.Router();

const channelRoutes = require("./channels/index");

router.use("/channels", channelRoutes);

module.exports = router;
