const Job = require("../Job");
const twitchApi = require("../../../../external_apis/twitch");
const db = require("../../../../database/models");

/**
 * Job to check that a vod still exists, and cleanup if its gone
 *
 * PAYLOAD: {
 *     vodId:
 * }
 * vodId: database id of twitch vod to check
 *
 * Vods expire after a certain period of time
 * Check twitch API to make sure the vod still exists, If it doesn't we delete it.
 * When deleting vods, also delete any lolMatchTwitchVod relations. Stale games will be deleted in another job
 */
class CheckVodExistenceJob extends Job {
  get vodId() {
    return this.payload.vodId;
  }

  async run() {
    let twitchVod;
    try {
      twitchVod = await db.twitchVods.getById(this.vodId);
    } catch (sqlError) {
      this.errors = `Error retrieving vod from DB - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    let accessToken;
    try {
      accessToken = await db.settings.getAccessToken();
      accessToken = accessToken?.setting_value;
    } catch (sqlError) {
      this.errors = `Error retrieving access token from DB - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    let statusCode;
    try {
      await twitchApi.getVodById(twitchVod.native_vod_id, accessToken);
      statusCode = 200;
    } catch (apiError) {
      statusCode = apiError.response.statusCode;
      if (statusCode === 429 || statusCode >= 500) {
        this.setToRetry();
        return this;
      }

      // 401 means our access token has expired, we create a high priority job and set this to retry
      if (statusCode === 401) {
        try {
          await db.jobs.createNewJob(
            Job.TYPES.FETCH_NEW_ACCESS_TOKEN,
            {},
            Job.PRIORITIES.URGENT
          );
        } catch (sqlError) {
          this.errors = `sql Error creating update twitch auth token job ${sqlError.message}`;
          console.error(sqlError);
          return this;
        }
        this.setToRetry();
        return this;
      }

      // API returns 404 if no vod is found when ID provided.
      if (statusCode !== 404) {
        this.errors = `Error retrieving vod from api - ${apiError.message}`;
        console.error(apiError);
        return this;
      }
    }

    if (statusCode === 404) {
      try {
        await db.twitchVods.deleteById(this.vodId);
      } catch (sqlError) {
        this.errors = `Error deleting vod by id - ${sqlError.message}`;
        console.error(sqlError);
        return this;
      }
      try {
        await db.lolMatchTwitchVods.deleteByVodId(this.vodId);
      } catch (sqlError) {
        this.errors = `Error deleting lol_match_twitch_vods by vodId - ${sqlError.message}`;
        console.error(sqlError);
        return this;
      }
    }

    return this;
  }
}

module.exports = CheckVodExistenceJob;
