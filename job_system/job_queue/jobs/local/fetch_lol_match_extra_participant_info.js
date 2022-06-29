const Job = require("../Job");
const db = require("../../../../database/models");

/**
 * Job to create extra jobs to fetch additional match information
 *
 * PAYLOAD: {
 *      matchId:
 * }
 * matchId: database id of lol_match we are creating extra jobs for
 *
 */
class FetchLolMatchExtraParticipantInfoJob extends Job {
  get matchId() {
    return this.payload.matchId;
  }

  async run() {
    let matchParticipants;
    try {
      matchParticipants = await db.lolMatchParticipant.getByMatchId(
        this.matchId
      );
    } catch (sqlError) {
      this.errors = `SQLError attempting to retrieve existing match participants from DB - ${sqlError.message}`;
      return this;
    }

    if (matchParticipants.length === 0) {
      this.errors = `Unable to find match participants for this match ${this.matchId}`;
      return this;
    }

    for (let matchParticipant of matchParticipants) {
      try {
        await db.jobs.createNewJob(
          Job.TYPES.FETCH_LOL_PARTICIPANT_RANK,
          {
            matchParticipantId: matchParticipant.id,
          },
          Job.PRIORITIES.LOW
        );
      } catch (sqlError) {
        this.errors = `SQL error while creating new fetch rank job - ${sqlError.message}`;
        return this;
      }

      try {
        await db.jobs.createNewJob(
          Job.TYPES.FETCH_LOL_PARTICIPANT_MASTERY,
          {
            matchParticipantId: matchParticipant.id,
          },
          Job.PRIORITIES.LOW
        );
      } catch (sqlError) {
        this.errors = `SQL error while creating new fetch mastery job - ${sqlError.message}`;
        return this;
      }
    }

    return this;
  }
}

module.exports = FetchLolMatchExtraParticipantInfoJob;
