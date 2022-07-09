const db = require("../../../database/models");
const Job = require("../../job_queue/jobs/Job");
const logger = require("../../../utils/logger");

/**
 * Creates a new REFRESH_LOL_ACCOUNT job for each lol_summoner in our DB
 *
 * interval: once per week
 */
async function refreshLolAccountInformation() {
  logger.verbose("Starting refreshLolAccountInformation");

  let lolSummoners;
  try {
    lolSummoners = await db.lolSummoners.getAll();
  } catch (sqlError) {
    logger.error(
      `refreshTwitchAccountInformation - Error getting all lolSummoners from DB - ${sqlError.message}`
    );
    return;
  }

  for (let summoner of lolSummoners) {
    const payload = {
      summonerId: summoner.id,
    };
    try {
      await db.jobs.createNewJob(Job.TYPES.REFRESH_LOL_ACCOUNT, payload);
    } catch (sqlError) {
      logger.error(
        `createCheckVodExistenceJob - Error creating REFRESH_LOL_ACCOUNT job for account - ${account}`
      );
      return;
    }
  }

  logger.verbose(`Created ${lolSummoners.length} REFRESH_LOL_ACCOUNT jobs`);
}

module.exports = refreshLolAccountInformation;
