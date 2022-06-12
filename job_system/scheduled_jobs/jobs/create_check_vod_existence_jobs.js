const db = require("../../../database/models");
const Job = require("../../job_queue/jobs/Job");
const logger = require("../../../utils/logger");

/**
 * Creates a new CHECK_VOD_EXISTENCE job for each vod in our DB
 *
 * interval: once per day
 */
async function createCheckVodExistenceJobs() {
  logger.verbose("Starting createCheckVodExistenceJobs");

  let twitchVods;
  try {
    twitchVods = await db.twitchVods.getAll();
  } catch (sqlError) {
    logger.error(
      `createCheckVodExistenceJob - Error getting all twitch vods from DB - ${sqlError.message}`
    );
    return;
  }

  for (let index in twitchVods) {
    let vod = twitchVods[index];
    let payload = {
      vodId: vod.id,
    };

    try {
      await db.jobs.createNewJob(Job.TYPES.CHECK_VOD_EXISTENCE, payload);
    } catch (sqlError) {
      logger.error(
        `createCheckVodExistenceJob - Error creating CHECK_VOD_EXISTENCE job for vod - ${vod.id}`
      );
      return;
    }
  }

  logger.verbose(`Created ${twitchVods.length} CHECK_VOD_EXISTENCE jobs`);
}

module.exports = createCheckVodExistenceJobs;
