const Job = require("../../job_system/job_queue/jobs/Job");
const db = require("../models");

function addTwitchAccountWithSummoners(_, body) {
  return db.jobs.createNewJob(
    Job.TYPES.FETCH_TWITCH_CHANNEL_ID,
    body,
    Job.PRIORITIES.HIGH
  );
}

module.exports = {
  addTwitchAccountWithSummoners,
};
