const CronJob = require("cron").CronJob;
const createFetchNewTwitchVodsJob = require("./jobs/create_fetch_new_twitch_vods_jobs");
const createCheckVodExistenceJobs = require("./jobs/create_check_vod_existence_jobs");
const deleteFinishedJobs = require("./jobs/delete_finished_jobs");
const deleteOldLolMatches = require("./jobs/delete_old_lol_matches");
const refreshLolAccounts = require("./jobs/refresh_lol_account_information");
const refreshTwitchAccounts = require("./jobs/refresh_twitch_account_information");
const createNewPaginationCursor = require("./jobs/create_new_pagination_cursor");

// Every day 1 after before midnight
const createFetchNewVods = new CronJob(
  "00 01 00 * * *",
  createFetchNewTwitchVodsJob
);

// Every day at midnight, runs before we start fetching new vods
const createNewPaginationCursorCron = new CronJob(
  "00 00 00 * * *",
  createNewPaginationCursor
);

// Every day at noon
const createCheckVodExistence = new CronJob(
  "00 00 12 * * *",
  createCheckVodExistenceJobs
);

// Every Monday at 5pm
const deleteFinishedJobsCron = new CronJob(
  "00 00 17 * * 1",
  deleteFinishedJobs
);

// Every Tuesday at 5pm
const deleteOldLolMatchesCron = new CronJob(
  "00 00 17 * * 2",
  deleteOldLolMatches
);

// First day of every month
const refreshTwitchAccountsCron = new CronJob(
  "00 00 00 01 * *",
  refreshTwitchAccounts
);

// Every Weds at 5pm
const refreshLolAccountsCron = new CronJob(
  "00 43 18 * * 1",
  // "00 00 17 * * 3",
  refreshLolAccounts
);

module.exports = {
  createFetchNewVods,
  createCheckVodExistence,
  deleteFinishedJobsCron,
  deleteOldLolMatchesCron,
  refreshTwitchAccountsCron,
  createNewPaginationCursorCron,
  refreshLolAccountsCron,
};
