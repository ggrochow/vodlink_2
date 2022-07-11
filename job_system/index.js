require("dotenv").config();
const jobQueues = require("./job_queue");
const cronJobs = require("./scheduled_jobs");
const logger = require("../utils/logger");

const { twitchJobQueue, lolJobQueue, nonApiJobQueue } = jobQueues;

logger.info("Initializing Job queues");
const lolInterval = setInterval(() => {
  lolJobQueue.run();
}, 100);
const twitchInterval = setInterval(() => {
  twitchJobQueue.run();
}, 100);
const localInterval = setInterval(() => {
  nonApiJobQueue.run();
}, 100);

const {
  createFetchNewVods,
  createCheckVodExistence,
  deleteFinishedJobsCron,
  deleteOldLolMatchesCron,
  refreshLolAccountsCron,
  refreshTwitchAccountsCron,
  createNewPaginationCursorCron,
} = cronJobs;

logger.info("Initializing CRON jobs");
createFetchNewVods.start();
createCheckVodExistence.start();
deleteFinishedJobsCron.start();
deleteOldLolMatchesCron.start();
refreshTwitchAccountsCron.start();
refreshLolAccountsCron.start();
createNewPaginationCursorCron.start();

// Handle graceful shutdowns
if (process.platform === "win32") {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function closeHandler() {
  console.log("SIGTERM Received, gracefully shutting down job queues");
  clearInterval(lolInterval);
  clearInterval(twitchInterval);
  clearInterval(localInterval);

  let running = true;
  let retries = 0;

  while (running === true || retries < 50) {
    running =
      lolJobQueue.isJobRunning() ||
      twitchJobQueue.isJobRunning() ||
      nonApiJobQueue.isJobRunning();

    retries++;
    await timeout(100);
  }

  if (!running) {
    console.log("Job queues have finished the current job, shutting down");
  } else {
    console.error(
      "Job queue still running",
      "lol",
      lolJobQueue.isJobRunning(),
      "twitch",
      twitchJobQueue.isJobRunning(),
      "local",
      nonApiJobQueue.isJobRunning()
    );
  }
  process.exit(running ? 1 : 0);
}

process.on("SIGTERM", closeHandler);
process.on("SIGINT", closeHandler);
