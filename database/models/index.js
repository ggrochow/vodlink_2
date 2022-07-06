const jobs = require("./jobs");
const twitchVods = require("./twitch_vods");
const twitchAccounts = require("./twitch_channels");
const lolSummoners = require("./lol_summoner");
const lolMatches = require("./lol_match");
const lolMatchParticipant = require("./lol_match_participants");
const lolMatchTwitchVods = require("./lol_match_twitch_vods");
const settings = require("./settings");

module.exports = {
  jobs,
  twitchAccounts,
  lolSummoners,
  twitchVods,
  lolMatches,
  lolMatchParticipant,
  lolMatchTwitchVods,
  settings,
};
