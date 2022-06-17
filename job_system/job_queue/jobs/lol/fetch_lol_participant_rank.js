const Job = require("../Job");
const db = require("../../../../database/models");
const lolApi = require("../../../../external_apis/lol");
/**
 * Job to fetch & update a LoL match participants rank for a given match
 *
 * PAYLOAD: {
 *    matchParticipantId:
 * }
 * matchParticipantId: Database id of the LoLMatchParticipant we need to get the rank of
 */
class FetchLoLParticipantRankJob extends Job {
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

    let rankedApiResponse;
    try {
      rankedApiResponse = await lolApi.getRankBySummonerId(
        lolMatch.region,
        matchParticipant.native_summoner_id
      );
      rankedApiResponse = rankedApiResponse.data;
    } catch (apiError) {
      if (apiError.statusCode === 429 || apiError.statusCode >= 500) {
        this.setToRetry();
        return this;
      }

      this.errors = `Api error retrieving ranked information for user ${matchParticipant.native_summoner_id} in region ${lolMatch.region}`;
    }

    const soloQueueRankObject = rankedApiResponse.find(
      (rank) => rank.queueType === "RANKED_SOLO_5x5"
    );

    if (!soloQueueRankObject) {
      this.errors = `No solo queue rank found for ${this.matchParticipantId}`;
      return this;
    }

    try {
      await db.lolMatchParticipant.setRankById(
        soloQueueRankObject.tier,
        soloQueueRankObject.rank,
        soloQueueRankObject.leaguePoints,
        this.matchParticipantId
      );
    } catch (sqlError) {
      console.error(sqlError);
      this.errors = `SQL error updating rank for ${this.matchParticipantId}`;
      return this;
    }

    return this;
  }
}

module.exports = FetchLoLParticipantRankJob;
