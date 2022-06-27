const logger = require("../../../utils/logger");

/**
 * Job for shared functions, to be subclassed from, don't use directly
 * run() must be overwritten by the subclasses implementation
 */
class Job {
  static PRIORITIES = {
    DEFAULT: 10,
    HIGH: 5,
    URGENT: 1,
  };

  static TYPES = {
    FETCH_TWITCH_CHANNEL_ID: "FETCH_TWITCH_CHANNEL_ID",
    FETCH_LOL_SUMMONER_ID: "FETCH_LOL_SUMMONER_ID",
    FETCH_NEW_TWITCH_VODS: "FETCH_NEW_TWITCH_VODS",
    FETCH_LOL_MATCHES_DURING_VOD: "FETCH_LOL_MATCHES_DURING_VOD",
    FETCH_LOL_MATCH_INFO: "FETCH_LOL_MATCH_INFO",
    DETERMINE_LOL_MATCH_ROLES: "DETERMINE_LOL_MATCH_ROLES",
    ASSOCIATE_LOL_MATCH_TO_TWITCH_VOD: "ASSOCIATE_LOL_MATCH_TO_TWITCH_VOD",
    CLEANUP_EXPIRED_TWITCH_VODS: "CLEANUP_EXPIRED_TWITCH_VODS",
    CHECK_VOD_EXISTENCE: "CHECK_VOD_EXISTENCE",
    FETCH_NEW_ACCESS_TOKEN: "FETCH_NEW_ACCESS_TOKEN",
    FETCH_LOL_MATCH_EXTRA_PARTICIPANT_INFO: "FETCH_EXTRA_LOL_PARTICIPANT_INFO",
    FETCH_LOL_PARTICIPANT_RANK: "FETCH_LOL_PARTICIPANT_RANK",
    FETCH_LOL_PARTICIPANT_MASTERY: "FETCH_LOL_PARTICIPANT_MASTERY",
  };

  static STATUS_TYPES = {
    NEW: "NEW",
    RUNNING: "RUNNING",
    RETRY: "RETRY",
    FINISHED: "FINISHED",
    ERROR: "ERROR",
  };

  constructor(jobRows) {
    this.jobRows = jobRows;
  }

  get shortName() {
    return this.jobRows.job_type;
  }

  get errors() {
    return this.jobRows.errors;
  }

  set errors(errorMessage) {
    this.jobRows.errors = errorMessage;
    this.logErrors();
  }

  get retryCount() {
    return this.payload.retryCount || 0;
  }

  set retryCount(count) {
    this.payload.retryCount = count;
  }

  get payload() {
    return this.jobRows.payload;
  }

  get id() {
    return this.jobRows.id;
  }

  setToRetry() {
    this.retry = true;
    this.retryCount = this.retryCount + 1;
  }

  logPrefix() {
    return `Job id: ${this.id} - ${this.shortName}`;
  }

  logErrors() {
    logger.error(`${this.logPrefix()} - ${this.errors}`);
  }

  run() {
    throw new Error(
      `Attempted to run Job::run(), overwrite method in subclass - ${this.shortName}`
    );
  }
}

module.exports = Job;
