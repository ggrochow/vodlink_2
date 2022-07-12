const queries = require("../../models/raw_queries");

const {
  getMatchupBody,
  mapMatchData,
  getVodlinkDataByMatchIds,
} = require("./utils");

const vodsPerPage = 10;

/**
 * Find VodLinks for up to a full matchup
 * @param matchupInfo Object with the all the above roleNames as keys.
 *                    roleNames may optionally have a championId as the value to be searched for
 *                    Object may optionally have a 'ROLE' key, with the value being a role string for the desired role
 *                    Object must have a 'PAGE' key for use in pagination
 */

async function matchupSearch(matchupInfo) {
  const { wheres, joins, params } = await getMatchupBody(matchupInfo);
  params.page = matchupInfo.PAGE || 1;
  params.limit = vodsPerPage;
  params.offset = (params.page - 1) * vodsPerPage;

  const baseQuery = `
     FROM 
        lol_matches lm
     ${joins.join("\n")}
     ${wheres.length > 0 ? "WHERE" : ""}
        ${wheres.join("\n\tand ")} 
  `;

  const paginationQuery = `
    SELECT 
      COUNT(DISTINCT lm.id)::int as total
    ${baseQuery}
  `;

  const pagination = await queries.one(paginationQuery, params);
  pagination.limit = vodsPerPage;
  pagination.page = params.page;

  const hasResults = pagination.total > 0;
  const isWithinPageLimits =
    params.page <= Math.ceil(pagination.total / vodsPerPage);

  let lolMatches = [];
  if (hasResults && isWithinPageLimits) {
    const query = `
     SELECT lm.*
     ${baseQuery}
     GROUP BY lm.id
     ORDER by lm.started_at DESC
     LIMIT $(limit) OFFSET $(offset)
  `;
    lolMatches = await queries.manyOrNone(query, params);
  }

  const lolMatchIds = lolMatches.map((match) => match.id);

  const { participants, vodLinks, vods, channels } =
    await getVodlinkDataByMatchIds(lolMatchIds);

  const matchData = mapMatchData(
    lolMatches,
    participants,
    vodLinks,
    vods,
    channels
  );

  return {
    data: matchData,
    pagination,
  };
}

module.exports = {
  matchupSearch,
};
