const Job = require("../Job");
const lolApi = require("../../../../external_apis/lol");
const db = require("../../../../database/models");
const logger = require("../../../../utils/logger");
const { lolSummoners } = require("../../../../database/models");

/**
 * Update lol account summoner name for a given account
 * This helps handle name changes
 *
 * PAYLOAD: {
 *     summonerId
 * }
 * summonerId: id of summoner in our database to refresh
 */
class RefreshLoLAccount extends Job {
  get summonerId() {
    return this.payload.summonerId;
  }

  async run() {
    let summoner;
    try {
      summoner = await db.lolSummoners.getById(this.summonerId);
    } catch (sqlError) {
      this.errors = `sql Error finding account from DB`;
      return this;
    }

    let apiResult;
    try {
      apiResult = await lolApi.getAccountInfoFromPuuid(
        summoner.region,
        summoner.native_puuid
      );
      apiResult = apiResult.data;
    } catch (apiError) {
      const statusCode = apiError.response.status;

      if (statusCode === 429 || statusCode >= 500) {
        this.setToRetry();
        return this;
      }

      this.errors = `Error fetching lol summoner from API - ${apiError.message}`;
      console.error(apiError);
      return this;
    }

    try {
      await db.lolSummoners.updateSummonerName(this.summonerId, apiResult.name);
    } catch (sqlError) {
      this.errors = `Error updating summoner name - ${sqlError.message}`;
      return this;
    }

    return this;
  }
}

module.exports = RefreshLoLAccount;
