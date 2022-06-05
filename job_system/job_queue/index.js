const JobQueue = require("./job_queue");
const Job = require("./jobs/Job");
const jobTypes = Job.TYPES;

const twitchJobTypes = [
  jobTypes.FETCH_TWITCH_CHANNEL_ID,
  jobTypes.FETCH_NEW_TWITCH_VODS,
  jobTypes.CHECK_VOD_EXISTENCE,
  jobTypes.FETCH_NEW_ACCESS_TOKEN,
];
// https://dev.twitch.tv/docs/api/guide/#rate-limits
// No bearer token = 30 requests per minute.
const twitchRateLimit = 2000;

let twitchJobQueue = new JobQueue(twitchJobTypes, twitchRateLimit, "Twitch");

const lolJobTypes = [
  jobTypes.FETCH_LOL_SUMMONER_ID,
  jobTypes.FETCH_LOL_MATCHES_DURING_VOD,
  jobTypes.FETCH_LOL_MATCH_INFO,
  jobTypes.DETERMINE_LOL_MATCH_ROLES,
];

// https://developer.riotgames.com/rate-limiting.html
// 100 requests every 2 minutes, around 833ms, round up to 900.
const lolRateLimit = 900;

let lolJobQueue = new JobQueue(lolJobTypes, lolRateLimit, "LoL");

const nonApiJobTypes = [jobTypes.ASSOCIATE_LOL_MATCH_TO_TWITCH_VOD];
const nonApiRateLimit = 100;

let nonApiJobQueue = new JobQueue(nonApiJobTypes, nonApiRateLimit, "SQL");

module.exports = {
  twitchJobQueue,
  lolJobQueue,
  nonApiJobQueue,
};
