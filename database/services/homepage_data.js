const db = require("../models");
const {
  getVodlinkDataByMatchIds,
  mapMatchData,
} = require("./matchupSearch/utils");

async function homepageData() {
  const lolMatch = await db.lolMatches.getMatchWithMostVods();
  const { participants, vodLinks, vods, channels } =
    await getVodlinkDataByMatchIds([lolMatch.id]);

  return mapMatchData([lolMatch], participants, vodLinks, vods, channels)[0];
}

module.exports = homepageData;
