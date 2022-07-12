const Job = require("../Job");
const twitchApi = require("../../../../external_apis/twitch");
const db = require("../../../../database/models");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const duration = require("dayjs/plugin/duration");
dayjs.extend(utc);
dayjs.extend(duration);

/**
 * Job to find all new twitch vods for a channel
 *
 * PAYLOAD: {
 *     twitchChannelId:
 *     cursor: *OPTIONAL*
 * }
 * twitchChannelId: database id of twitch channel
 * cursor: api pagination cursor, optionally included if a single api query doesn't return all vods
 *
 * If any new vods are found, creates a FetchLolMatchesDuringVod job for EACH summoner account associated with the channel
 * Since our jobs are limited to 1 API query per job, we need a multiple jobs if multiple summoners exist
 */
class FetchNewTwitchVodsJob extends Job {
  get twitchChannelId() {
    return this.payload.twitchChannelId;
  }

  get cursor() {
    return this.payload.cursor;
  }

  async run() {
    // Get Channel info from our database
    let twitchChannel;
    try {
      twitchChannel = await db.twitchAccounts.getById(this.twitchChannelId);
    } catch (sqlError) {
      this.errors = `Error retrieving twitch account info from DB - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    if (twitchChannel === undefined) {
      this.errors = `No twitch_account with id: ${this.twitchChannelId} found in our DB`;
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

    let nativeChannelId = twitchChannel.native_channel_id;
    let apiResult;
    // API query to find archive of vods for channel
    try {
      apiResult = await twitchApi.getVodsForChannel(
        nativeChannelId,
        accessToken,
        this.cursor
      );
      apiResult = apiResult.data;
    } catch (apiError) {
      const statusCode = apiError.response.status;

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

      this.errors = `Error retrieving vods from twitch API - ${apiError.message}`;
      console.error(apiError);
      return this;
    }

    // If we hit the max page size, create another FETCH_NEW_TWITCH_VODS job with cursor info.
    if (apiResult.data.length === 100) {
      let payload = {
        cursor: apiResult.pagination.cursor,
        twitchChannelId: this.twitchChannelId,
      };

      try {
        await db.jobs.createNewJob(Job.TYPES.FETCH_NEW_TWITCH_VODS, payload);
      } catch (sqlError) {
        this.errors = `Error while creating fetchNewTwitchVods job with pagination cursor - ${sqlError.message}`;
        console.error(sqlError);
        return this;
      }
    }

    if (apiResult.data.length === 0) {
      return this;
    }

    // Get list of known vod Ids
    let nativeVodIdsInDatabase;
    try {
      nativeVodIdsInDatabase =
        await db.twitchVods.getAllNativeVodIdsByTwitchChannelId(
          this.twitchChannelId
        );
      nativeVodIdsInDatabase = nativeVodIdsInDatabase.map(
        (res) => res.native_vod_id
      );
    } catch (sqlError) {
      this.errors = `Error while fetching known vodIds from database - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    let lolSummoners;
    try {
      lolSummoners = await db.lolSummoners.getAllByTwitchId(
        this.twitchChannelId
      );
    } catch (sqlError) {
      this.errors = `Error while fetching summoner accounts from database - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }
    // For each vod, if its new, public, and created within the last month,
    // create DB entry then foreach lol account associated - a new FIND_LOL_MATCHES_DURING_VOD job.
    let oneMonthAgo = dayjs().subtract(1, "month");
    for (let vodIndex in apiResult.data) {
      let vodInfo = apiResult.data[vodIndex];

      if (vodInfo.thumbnail_url === "") {
        // vods will show up in results while people are still streaming, meaning that vod is still being made.
        // It seems like the only difference in 'complete' vods and in progress vods is thumbnail_url
        // empty string is my indicates that the vod is still being made/processed.
        continue;
      }

      if (vodInfo.viewable !== "public") {
        continue;
      }

      let nativeVodId = vodInfo.id;
      if (nativeVodIdsInDatabase.includes(nativeVodId)) {
        continue;
      }

      let startTime = dayjs.utc(vodInfo.created_at);
      if (startTime < oneMonthAgo) {
        continue;
      }

      let endTime = calculateVodEndTime(vodInfo.duration, vodInfo.created_at);
      // Create vod in DB
      let twitchVod;
      try {
        twitchVod = await db.twitchVods.createNew(
          startTime,
          endTime,
          this.twitchChannelId,
          nativeVodId
        );
      } catch (sqlError) {
        this.errors = `Error while creating twich_vod - ${sqlError.message}`;
        console.error(sqlError);
        return this;
      }

      // Create a look at vods job for each summoner account associated
      for (let summonerIndex in lolSummoners) {
        let summonerAccount = lolSummoners[summonerIndex];

        try {
          let payload = {
            twitchVodId: twitchVod.id,
            summonerId: summonerAccount.id,
          };
          await db.jobs.createNewJob(
            Job.TYPES.FETCH_LOL_MATCHES_DURING_VOD,
            payload
          );
        } catch (sqlError) {
          this.errors = `Error while creating FETCH LOL MATCH JOB - ${sqlError.message}`;
          console.error(sqlError);
          return this;
        }
      }
    }

    return this;
  }
}

function calculateVodEndTime(durationString, startedAt) {
  let iso8601Duration = `PT${durationString.toUpperCase()}`;
  let duration = dayjs.duration(iso8601Duration);

  let startTime = dayjs.utc(startedAt);
  return startTime.add(duration);
}

module.exports = FetchNewTwitchVodsJob;
