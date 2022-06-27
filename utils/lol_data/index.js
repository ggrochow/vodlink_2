const championById = require("./champion.json");

const LOL_ROLES = ["BOT", "JUNGLE", "MID", "SUPPORT", "TOP"];
const DB_LOL_ROLES = ["BOTTOM", "JUNGLE", "MIDDLE", "UTILITY", "TOP"];
const LOL_RANKS = [
  "BRONZE",
  "CHALLENGER",
  "DIAMOND",
  "GOLD",
  "GRANDMASTER",
  "IRON",
  "MASTER",
  "PLATINUM",
  "SILVER",
];

module.exports = {
  championById,
  LOL_RANKS,
  LOL_ROLES,
  DB_LOL_ROLES,
};
