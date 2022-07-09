const createFetchNewTwitchVodsJob = require("../../job_system/scheduled_jobs/jobs/create_fetch_new_twitch_vods_jobs");
require("dotenv").config();

createFetchNewTwitchVodsJob()
  .then(() => {
    console.log("created vod jobs");
  })
  .catch((err) => {
    console.error(err);
  });
