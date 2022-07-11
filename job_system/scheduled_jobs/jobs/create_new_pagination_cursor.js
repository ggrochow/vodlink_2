const logger = require("../../../utils/logger");
const db = require("../../../database/models");
const { settingTypes } = require("../../../database/models/settings");

/**
 * Updates the internal match id cursor for pagination.
 *
 * Interval: right before we start fetching new vods
 */
async function createNewPaginationCursor() {
  logger.verbose("Starting createNewPaginationCursor job");

  let lolMatch;
  try {
    lolMatch = await db.lolMatches.getMostRecentLolMatchWithFullData();
  } catch (sqlError) {
    console.error(sqlError);
    logger.error(
      `Error retrieving most recent lol match - ${sqlError.message}`
    );
    return;
  }

  if (!lolMatch) {
    logger.info(
      "No lol match with all rank/mastery data found, not setting a cursor"
    );
    return;
  }

  try {
    await db.settings.upsertSetting(
      settingTypes.VODLINK_PAGINATION_CURSOR,
      lolMatch.id
    );
  } catch (sqlError) {
    console.error(sqlError);
    logger.error(
      `Error updating ${settingTypes.VODLINK_PAGINATION_CURSOR} to ${lolMatch.id} - ${sqlError.message}`
    );
    return this;
  }

  logger.verbose(
    `Finished createNewPaginationCursor job, new cursor ${lolMatch.id}`
  );
}

module.exports = createNewPaginationCursor;
