const Job = require("../Job");
const logger = require("../../../../utils/logger");
const lolApi = require("../../../../external_apis/lol");
const db = require("../../../../database/models");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

/**
 * Job to find a list of all lol_matches played by a streamer during a given twitch vod
 *
 * PAYLOAD: {
 *     twitchVodId:
 *     summonerId:
 * }
 * twitchVodId: database id of twitch vod
 * summonerId: database id of summoner account
 *
 *
 * If we find any matches, create a new FetchLoLMatchInfo job for each
 */
class FetchLolMatchesDuringVodJob extends Job {
  get twitchVodId() {
    return this.payload.twitchVodId;
  }

  get lolSummonerId() {
    return this.payload.summonerId;
  }

  async run() {
    let twitchVod;
    try {
      twitchVod = await db.twitchVods.getById(this.twitchVodId);
    } catch (sqlError) {
      this.errors = `Error fetching twitch vod from database - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    let lolSummoner;
    try {
      lolSummoner = await db.lolSummoners.getById(this.lolSummonerId);
    } catch (sqlError) {
      this.errors = `Error fetching twitch vod from database - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    let startTime = dayjs.utc(twitchVod.started_at).unix();
    let endTime = dayjs.utc(twitchVod.ended_at).unix();

    let apiResults;
    try {
      apiResults = await lolApi.getMatchesForAccountInPeriod(
        lolSummoner.region,
        lolSummoner.native_puuid,
        startTime,
        endTime
      );
      apiResults = apiResults.data;
    } catch (apiError) {
      const statusCode = apiError.response.statusCode;

      if (statusCode === 429 || statusCode >= 500) {
        this.setToRetry();
        return this;
      }

      if (statusCode === 404) {
        // 404 is returned if no results are found
        logger.verbose(
          `${this.logPrefix()} got 404 while searching for games, assuming that means none found for this vod`
        );
        return this;
      }

      this.errors = `Error fetching lol matchlist from API - ${apiError.message}`;
      console.error(apiError);
      return this;
    }

    for (let matchIndex in apiResults) {
      let nativeMatchId = apiResults[matchIndex];

      try {
        let payload = {
          nativeMatchId,
          region: lolSummoner.region,
        };
        await db.jobs.createNewJob(Job.TYPES.FETCH_LOL_MATCH_INFO, payload);
      } catch (sqlError) {
        this.errors = `Error saving FETCH MATCH INFO job - ${sqlError}`;
        console.error(sqlError);
        return this;
      }
    }

    return this;
  }
}

module.exports = FetchLolMatchesDuringVodJob;
