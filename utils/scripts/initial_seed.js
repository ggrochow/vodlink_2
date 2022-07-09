/*
    Initial seed file for database.
    Adds twitch channels & respective LoL accounts to database for job queue to do its thing.
 */
require("dotenv").config();

const db = require("../../database/models");
const Job = require("../../job_system/job_queue/jobs/Job.js");
const ACCOUNTS = require("../lol_data/seed.json");

ACCOUNTS.forEach((accountObj) => {
  let jobType = Job.TYPES.FETCH_TWITCH_CHANNEL_ID;
  let payload = {
    twitchName: accountObj.channel_name,
    lolAccounts: accountObj.summoners,
  };

  db.jobs
    .createNewJob(jobType, payload)
    .catch((e) => console.error(e))
    .then((data) => console.log(data));
});

db.jobs
  .createNewJob(Job.TYPES.FETCH_NEW_ACCESS_TOKEN, {}, Job.PRIORITIES.URGENT)
  .catch((e) => console.error(e))
  .then((data) => console.log(data));
