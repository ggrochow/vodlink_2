const queries = require("../../models/raw_queries");
const {
  lolMatchParticipant,
  lolMatchTwitchVods,
  twitchVods,
  twitchAccounts,
} = require("../../models");

const { getMatchupBody } = require("./utils");

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
  params.offset = (matchupInfo.PAGE - 1) * vodsPerPage;

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

  const lolMatchIds = [];
  const vodlinkIds = [];
  lolMatches.forEach((match) => {
    lolMatchIds.push(match.id);
  });

  const participants = await lolMatchParticipant.getByMatchIds(lolMatchIds);
  for (const participant of participants) {
    if (participant.lol_match_twitch_vods_id) {
      vodlinkIds.push(participant.lol_match_twitch_vods_id);
    }
  }

  const vodLinks = await lolMatchTwitchVods.getByIds(vodlinkIds);
  const vodIds = vodLinks.map((vodLink) => vodLink.twitch_vod_id);
  const vods = await twitchVods.getByIds(vodIds);
  const channelIds = vods.map((vod) => vod.twitch_channel_id);
  const channels = await twitchAccounts.getByIds(channelIds);

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

function mapMatchData(lolMatches, participants, vodLinks, vods, channels) {
  return lolMatches.map((lolMatch) => {
    const matchParticipants = participants.filter(
      (participant) => participant.lol_match_id === lolMatch.id
    );
    lolMatch.participants = matchParticipants.map((participant) => {
      const vodlinkId = participant.lol_match_twitch_vods_id;
      if (!vodlinkId) {
        return participant;
      }

      participant.vodLink = vodLinks.find(
        (vodlink) => vodlink.id === vodlinkId
      );
      participant.vod = vods.find(
        (vod) => vod.id === participant.vodLink?.twitch_vod_id
      );
      participant.channel = channels.find(
        (channel) => channel.id === participant.vod?.twitch_channel_id
      );
      return participant;
    });

    return lolMatch;
  });
}

module.exports = {
  matchupSearch,
};
