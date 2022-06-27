const twitchApi = require("../../../../external_apis/twitch");
const Job = require("../Job");
const db = require("../../../../database/models");

/**
 * Finds native id for a twitch channel by name
 *
 * PAYLOAD: {
 *     twitchName:
 *     lolAccounts: [
 *          { name: , region: }
 *     ]
 * }
 * twitchName: name of the twitch channel to lookup
 * lolAccounts: array of objects with a name&region field containing information on this channels summoner account(s)
 *
 * Creates a FetchLolSummonerId job for each object in the lolAccounts array.
 */
class FetchTwitchChannelIdJob extends Job {
  get channelName() {
    return this.payload.twitchName;
  }

  get lolAccounts() {
    return this.payload.lolAccounts;
  }

  async run() {
    let accessToken;
    try {
      accessToken = await db.settings.getAccessToken();
      accessToken = accessToken?.setting_value;
    } catch (sqlError) {
      this.errors = `sql Error getting twitch auth token ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    let apiResult;
    try {
      apiResult = await twitchApi.getUserInfoFromChannelName(
        this.channelName,
        accessToken
      );
      apiResult = apiResult.data;
    } catch (apiError) {
      const status = apiError.response.status;
      // all branches return , can likely have common handling logic
      if (status === 429 || status >= 500) {
        this.setToRetry();
        return this;
      }

      // 401 means our access token has expired, we create a high priority job and set this to retry
      if (status === 401) {
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

      this.errors = `error while fetching twitch channel info - ${apiError.message}`;
      console.error(apiError);
      return this;
      // Set relevant errors on job, return it.
    }

    if (apiResult?.data?.[0]?.id === undefined) {
      // No results found for name, error this
      this.errors = `No twitch channel with the username ${this.channelName} found via twitchapi`;
      return this;
    }

    let nativeTwitchId = apiResult.data[0].id;

    let twitchAccount;
    try {
      twitchAccount = await db.twitchAccounts.getByNativeId(nativeTwitchId);
    } catch (sqlError) {
      this.errors = `sql Error retrieving existing twitch account from db`;
      console.error(sqlError);
      return this;
    }

    if (!twitchAccount) {
      let twitchDisplayName = apiResult.data[0].display_name;
      let twitchName = apiResult.data[0].login;

      try {
        twitchAccount = await db.twitchAccounts.createNew(
          twitchName,
          twitchDisplayName,
          nativeTwitchId
        );
      } catch (sqlErr) {
        this.errors = `SQL error while saving twitch account - ${sqlErr.message}`;
        console.error(sqlErr);
        return this;
      }
    }

    const twitchChannelId = twitchAccount.id;
    for (let lolAccountInfo of this.lolAccounts) {
      let payload = {
        twitchChannelId,
        summonerName: lolAccountInfo.name,
        summonerRegion: lolAccountInfo.region,
      };

      try {
        await db.jobs.createNewJob(Job.TYPES.FETCH_LOL_SUMMONER_ID, payload);
      } catch (sqlErr) {
        this.errors = `SQL error saving ${Job.TYPES.FETCH_LOL_SUMMONER_ID} job, ${sqlErr.message}`;
        console.error(sqlErr);
        return this;
      }
    }

    return this;
  }
}

module.exports = FetchTwitchChannelIdJob;
