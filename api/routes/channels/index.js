const express = require("express");
const router = express.Router();

const { getFactory, postFactory } = require("../controller_factories");
const {
  getAllChannelsWithSummoners,
} = require("../../../database/services/channels_with_summoners");
const { validateBodyFactory } = require("../../schemas/middleware_factories");
const { addChannelsWithSummonersSchema } = require("../../schemas/channels");
const {
  addTwitchAccountWithSummoners,
} = require("../../../database/services/add_twitch_account_with_summoners");

router.get("/", getFactory(getAllChannelsWithSummoners));

router.post(
  "/",
  validateBodyFactory(addChannelsWithSummonersSchema),
  postFactory(addTwitchAccountWithSummoners)
);

module.exports = router;
