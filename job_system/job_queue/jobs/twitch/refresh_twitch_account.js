const Job = require("../Job");
const db = require("../../../../database/models");
const twitchApi = require("../../../../external_apis/twitch");

/**
 * Update twitch account display / login name for a given twitch account
 * This helps handle name changes
 *
 * PAYLOAD: {
 *     accountId
 * }
 * accountId: id of account in our database to refresh
 */
class RefreshTwitchAccount extends Job {
  get accountId() {
    return this.payload.accountId;
  }

  async run() {
    let twitchAccount;
    try {
      twitchAccount = await db.twitchAccounts.getById(this.accountId);
    } catch (sqlError) {
      this.errors = `sql Error finding account from DB`;
      return this;
    }

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
      apiResult = await twitchApi.getUserInfoFromNativeId(
        twitchAccount.native_channel_id,
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
      this.errors = `No twitch channel with the id ${twitchAccount.native_channel_id} found via twitchapi`;
      return this;
    }

    const apiAccountInfo = apiResult.data[0];
    try {
      await db.twitchAccounts.updateDisplayAndLoginName(
        this.accountId,
        apiAccountInfo.display_name,
        apiAccountInfo.login
      );
    } catch (sqlError) {
      this.errors = `SQL error updating twitch account with new name info`;
      return this;
    }

    return this;
  }
}

module.exports = RefreshTwitchAccount;
