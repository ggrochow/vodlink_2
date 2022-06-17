const Job = require("../Job");
const db = require("../../../../database/models");
const lolApi = require("../../../../external_apis/lol");
/**
 * Job to fetch & update a LoL match participants champion mastery for a given match
 *
 * PAYLOAD: {
 *    matchParticipantId:
 * }
 * matchParticipantId: Database id of the LoLMatchParticipant we need to get the rank of
 */
class FetchLoLMatchParticipantMasteryJob extends Job {
  get matchParticipantId() {
    return this.payload.matchParticipantId;
  }

  async run() {
    let matchParticipant;
    try {
      matchParticipant = await db.lolMatchParticipant.getById(
        this.matchParticipantId
      );
    } catch (sqlError) {
      this.errors = `SQLError attempting to retrieve match participant from DB - ${sqlError.message}`;
      return this;
    }

    if (!matchParticipant) {
      this.errors = `Unable to find participant for this id ${this.matchParticipantId}`;
      return this;
    }

    let lolMatch;
    try {
      lolMatch = await db.lolMatches.getById(matchParticipant.lol_match_id);
    } catch (sqlError) {
      this.errors = `SQLError attempting to retrieve match from DB - ${sqlError.message}`;
      return this;
    }

    let masteryApiResponse;
    try {
      masteryApiResponse = await lolApi.getMasteryBySummonerIdAndChampion(
        lolMatch.region,
        matchParticipant.native_summoner_id,
        matchParticipant.champion_id
      );
      masteryApiResponse = masteryApiResponse.data;
    } catch (apiError) {
      if (apiError.statusCode === 429 || apiError.statusCode >= 500) {
        this.setToRetry();
        return this;
      }
      console.log(apiError);

      this.errors = `Api error retrieving mastery for user ${matchParticipant.native_summoner_id} ${matchParticipant.champion_id} in region ${lolMatch.region}`;
      return this;
    }

    try {
      await db.lolMatchParticipant.setMasteryById(
        masteryApiResponse.championLevel,
        masteryApiResponse.championPoints,
        this.matchParticipantId
      );
    } catch (sqlError) {
      console.error(sqlError);
      this.errors = `SQL error updating mastery for ${this.matchParticipantId}`;
      return this;
    }

    return this;
  }
}

module.exports = FetchLoLMatchParticipantMasteryJob;
