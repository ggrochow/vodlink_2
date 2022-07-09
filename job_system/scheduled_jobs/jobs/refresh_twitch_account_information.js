const db = require("../../../database/models");
const Job = require("../../job_queue/jobs/Job");
const logger = require("../../../utils/logger");
const { ref } = require("joi");

/**
 * Creates a new REFRESH_TWITCH_ACCOUNT job for each twitch_account in our DB
 *
 * interval: once per week
 */
async function refreshTwitchAccountInformation() {
  logger.verbose("Starting refreshTwitchAccountInformation");

  let twitchAccounts;
  try {
    twitchAccounts = await db.twitchAccounts.getAll();
  } catch (sqlError) {
    logger.error(
      `refreshTwitchAccountInformation - Error getting all twitchAccounts from DB - ${sqlError.message}`
    );
    return;
  }

  for (let account of twitchAccounts) {
    const payload = {
      accountId: account.id,
    };
    try {
      await db.jobs.createNewJob(Job.TYPES.REFRESH_TWITCH_ACCOUNT, payload);
    } catch (sqlError) {
      logger.error(
        `createCheckVodExistenceJob - Error creating REFRESH_TWITCH_ACCOUNT job for account - ${account}`
      );
      return;
    }
  }

  logger.verbose(
    `Created ${twitchAccounts.length} REFRESH_TWITCH_ACCOUNT jobs`
  );
}

module.exports = refreshTwitchAccountInformation;
