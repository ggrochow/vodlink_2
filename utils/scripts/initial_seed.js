/*
    Initial seed file for database.
    Adds twitch channels & respective LoL accounts to database for job queue to do its thing.
 */
require("dotenv").config();

const db = require("../../database/models");
const Job = require("../../job_system/job_queue/jobs/Job.js");

const ACCOUNTS = [
  {
    twitch_name: "thebausffs",
    lol_accounts: [
      {
        region: "euw1",
        name: "thebausffs",
      },
    ],
  },
  {
    twitch_name: "loltyler1",
    lol_accounts: [
      {
        region: "na1",
        name: "COOKIEMONSTER123",
      },
    ],
  },
  {
    twitch_name: "noway4u_sir",
    lol_accounts: [
      {
        region: "euw1",
        name: "WashedUp4USir",
      },
    ],
  },
  {
    twitch_name: "doublelift",
    lol_accounts: [
      {
        region: "na1",
        name: "doublelift",
      },
    ],
  },
  {
    twitch_name: "rush",
    lol_accounts: [
      {
        region: "kr",
        name: "never my fault",
      },
      {
        region: "kr",
        name: "pvman",
      },
    ],
  },
  {
    twitch_name: "yoda",
    lol_accounts: [
      {
        region: "br1",
        name: "YOCHALLENGER2022",
      },
    ],
  },
  {
    twitch_name: "bbbb87",
    lol_accounts: [
      {
        region: "kr",
        name: "1314 bOuOd",
      },
    ],
  },
  {
    twitch_name: "RATIRL",
    lol_accounts: [
      {
        region: "euw1",
        name: "Villager C",
      },
    ],
  },
  {
    twitch_name: "sneakylol",
    lol_accounts: [
      {
        region: "na1",
        name: "SentientAI",
      },
    ],
  },
];

//midbeast - na - hamburgereater59

ACCOUNTS.forEach((accountObj) => {
  let jobType = Job.TYPES.FETCH_TWITCH_CHANNEL_ID;
  let payload = {
    twitchName: accountObj.twitch_name,
    lolAccounts: accountObj.lol_accounts,
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
