const createFetchNewTwitchVodsJob = require("../../job_system/scheduled_jobs/jobs/create_fetch_new_twitch_vods_jobs");
const createNewPaginationCursorJob = require("../../job_system/scheduled_jobs/jobs/create_new_pagination_cursor");
require("dotenv").config();

createNewPaginationCursorJob()
  .then(() => {
    console.log("created pagination cursor");
    createFetchNewTwitchVodsJob()
      .then(() => {
        console.log("created vod jobs");
      })
      .catch((err) => {
        console.error(err);
      });
  })
  .catch((err) => {
    console.error(err);
  });
