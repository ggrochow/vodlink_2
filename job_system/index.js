require("dotenv").config();
const jobQueues = require("./job_queue");
const cronJobs = require("./scheduled_jobs");
const logger = require("../utils/logger");

const { twitchJobQueue, lolJobQueue, nonApiJobQueue } = jobQueues;

logger.info("Initializing Job queues");
setInterval(() => {
  lolJobQueue.run();
}, 1000);
setInterval(() => {
  twitchJobQueue.run();
}, 1000);
setInterval(() => {
  nonApiJobQueue.run();
}, 1000);

// const {
//   createFetchNewVods,
//   createCheckVodExistence,
//   deleteFinishedJobsCron,
//   deleteOldLolMatchesCron,
// } = cronJobs;
//
// logger.info("Initializing CRON jobs");
// createFetchNewVods.start();
// createCheckVodExistence.start();
// deleteFinishedJobsCron.start();
// deleteOldLolMatchesCron.start();
