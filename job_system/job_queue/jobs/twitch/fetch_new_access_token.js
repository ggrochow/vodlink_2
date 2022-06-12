const Job = require("../Job");
const twitchApi = require("../../../../external_apis/twitch");
const db = require("../../../../database/models");

/**
 * Job renew our twitch API client oauth token
 *
 * PAYLOAD: {}
 * None
 *
 * Gets a new "client_credentials" access token from twitch API
 * Updates our settings table with the new token
 */
class FetchNewAccessToken extends Job {
  async run() {
    let accessTokenResponse;
    try {
      accessTokenResponse = await twitchApi.getAccessToken();
      accessTokenResponse = accessTokenResponse.data;
    } catch (apiError) {
      this.errors = `Error retrieving access token from twitch API - ${apiError.message}`;
      console.error(apiError);
      return this;
    }

    const accessToken = accessTokenResponse.access_token;
    try {
      await db.settings.upsertSetting(
        db.settings.settingTypes.TWITCH_ACCESS_TOKEN,
        accessToken
      );
    } catch (dbError) {
      this.errors = `Error updating the access token setting - ${dbError.message}`;
      console.error(dbError);
      return this;
    }

    return this;
  }
}

module.exports = FetchNewAccessToken;
