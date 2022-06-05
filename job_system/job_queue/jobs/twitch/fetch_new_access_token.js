const Job = require("../Job");
const twitchApi = require("../../../../external_apis/twitch");
const db = require("../../../../database");

class FetchNewAccessToken extends Job {
  async run() {
    let accessTokenResponse;
    try {
      accessTokenResponse = await twitchApi.getAccessToken();
      console.log(accessTokenResponse);
    } catch (apiError) {
      this.errors = `Error retrieving access token from twitch API - ${apiError.message}`;
      console.error(apiError);
      return this;
    }

    const accessToken = accessTokenResponse;
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
