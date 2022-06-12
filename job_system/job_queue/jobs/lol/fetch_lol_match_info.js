const Job = require("../Job");
const lolApi = require("../../../../external_apis/lol");
const db = require("../../../../database/models");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

/**
 * Job to get details about a LoL Match and its participants
 *
 * PAYLOAD : {
 *     nativeMatchId:
 *     region:
 * }
 * nativeMatchId: native lol API match id
 * region: region match took place.
 *
 * Starts an AssociateLolMatchToTwitchVod job after completion.
 */
class FetchLolMatchInfoJob extends Job {
  get nativeMatchId() {
    return this.payload.nativeMatchId;
  }

  get region() {
    return this.payload.region;
  }

  async run() {
    // This match can already exist if another streamer was in the game.
    let lolMatch;
    try {
      lolMatch = await db.lolMatches.getByRegionAndNativeId(
        this.region,
        this.nativeMatchId
      );
    } catch (sqlError) {
      this.errors = `SQLError attempting to retrieve existing match from DB - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    // If we know about it, we don't need to collect any more info, but we might have new vods to compare against
    // so we create a new associate job to check.
    if (lolMatch !== undefined && lolMatch !== null) {
      try {
        let payLoad = { matchId: lolMatch.id };
        await db.jobs.createNewJob(
          Job.TYPES.ASSOCIATE_LOL_MATCH_TO_TWITCH_VOD,
          payLoad
        );
        return this;
      } catch (sqlError) {
        this.errors = `SQL error when creating ASSOCIATE job - ${sqlError.message}`;
        console.error(sqlError);
        return this;
      }
    }

    let apiResult;
    try {
      apiResult = await lolApi.getMatchInfoById(
        this.region,
        this.nativeMatchId
      );
      apiResult = apiResult.data;
    } catch (apiError) {
      if (apiError.statusCode === 429 || apiError.statusCode >= 500) {
        this.setToRetry();
        return this;
      }

      this.errors = `Error while retrieving match info from lol api - ${apiError.message}`;
      console.error(apiError);
      return this;
    }

    // We only want to show ranked solo Q games.
    const soloQueueRankedId = 420;
    if (apiResult.info.queueId !== soloQueueRankedId) {
      return this;
    }

    const startTime = dayjs.utc(apiResult.info.gameCreation);
    const endTime = startTime.clone().add(apiResult.info.gameDuration, "s");

    const minimumGameLength = 12 * 60;
    if (apiResult.info.gameDuration < minimumGameLength) {
      // The library used to determine roles requires at least 12 minutes of Game time
      // additionally games took less than 12m are likely of very low quality.
      return this;
    }

    const winningTeam = apiResult.info.teams.find((teamInfo) => teamInfo.win);
    let winningTeamId = winningTeam.teamId;

    try {
      lolMatch = await db.lolMatches.createNew(
        this.nativeMatchId,
        winningTeamId,
        startTime,
        endTime,
        this.region
      );
    } catch (sqlError) {
      this.errors = `Error saving lolMatch to database - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    // Gather all participant info, it lives in two separate arrays in the api results, so we have to do some combining
    let participants = {};

    for (let participant of apiResult.info.participants) {
      let participantInfo = {
        participantId: participant.participantId,
        teamId: participant.teamId,
        championId: participant.championId,
        accountId: participant.summonerId,
        puuid: participant.puuid,
        summonerName: participant.summonerName,
        role: participant.teamPosition,
      };

      participants[participantInfo.participantId] = participantInfo;
    }

    let participantMapping = {
      // participantId: lol_match_participant.id
    };

    // Save all our participant info
    let matchId = lolMatch.id;
    for (let participantId in participants) {
      let participantInfo = participants[participantId];
      try {
        let participant = await db.lolMatchParticipant.createNew(
          matchId,
          participantInfo.teamId,
          participantInfo.championId,
          participantInfo.summonerName,
          participantInfo.accountId,
          participantInfo.role
        );

        participantMapping[participantId] = participant.id;
      } catch (sqlError) {
        this.errors = `Error saving lol_match_participant to DB - ${sqlError.message}`;
        console.error(sqlError);
        return this;
      }
    }

    try {
      await db.jobs.createNewJob(Job.TYPES.ASSOCIATE_LOL_MATCH_TO_TWITCH_VOD, {
        matchId: lolMatch.id,
      });
    } catch (sqlError) {
      this.errors = `SQL error while creating new associate job - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }
    return this;
  }
}

module.exports = FetchLolMatchInfoJob;
