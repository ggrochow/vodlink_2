require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.port || 3001;
const {
  vodlinkRoleCounts,
  vodlinkChampionCounts,
  vodlinkEnemyChampionCounts,
} = require("../database/vodlink_counts");
const { matchupSearch } = require("../database/full_matchup_search");

function getFactory(countFn) {
  return async (req, res) => {
    try {
      const counts = await countFn(req.query);
      return res.status(200).send(counts);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
}

app.get("/counts/roleCounts", getFactory(vodlinkRoleCounts));
app.get("/counts/champCounts", getFactory(vodlinkChampionCounts));
app.get("/counts/enemyChampCounts", getFactory(vodlinkEnemyChampionCounts));
app.get("/vodlinks/matchupSearch", getFactory(matchupSearch));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});