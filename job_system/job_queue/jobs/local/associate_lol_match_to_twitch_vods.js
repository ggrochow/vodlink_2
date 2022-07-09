const Job = require("../Job");
const db = require("../../../../database/models");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
const utc = require("dayjs/plugin/utc");
dayjs.extend(duration);
dayjs.extend(utc);

/**
 * Job to find all twitch vods that this lol match was played on.
 * Creates a lolMatchTwitchVod association for each Vod found.
 *
 * PAYLOAD: {
 *      matchId:
 * }
 * matchId: database id of lol_match we are associating
 *
 */
class AssociateLolMatchToTwitchVodsJob extends Job {
  get matchId() {
    return this.payload.matchId;
  }

  async run() {
    let lolMatch;
    try {
      lolMatch = await db.lolMatches.getById(this.matchId);
    } catch (sqlError) {
      this.errors = `SQL Error while finding lol match - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    let matchParticipants;
    try {
      matchParticipants = await db.lolMatchParticipant.getByMatchId(
        this.matchId
      );
    } catch (sqlError) {
      this.errors = `SQL Error while finding lol match participants - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }
    let nativeSummonerIds = matchParticipants.map(
      (participant) => participant.native_summoner_id
    );

    let twitchAccounts;
    try {
      twitchAccounts = await db.twitchAccounts.getByNativeSummonerIds(
        nativeSummonerIds
      );
    } catch (sqlError) {
      this.errors = `SQL Error while finding twitch accounts - ${sqlError.message}`;
      console.error(sqlError);
      return this;
    }

    if (twitchAccounts === undefined || twitchAccounts.length === 0) {
      this.errors = `Error, no twitch accounts found in this Lol match`;
      return this;
    }

    let matchStart = dayjs.utc(lolMatch.started_at);
    let matchEnd = dayjs.utc(lolMatch.ended_at);

    let createdVodlinks = 0;
    let updatedLMPs = 0;

    for (let twitchAccount of twitchAccounts) {
      let twitchVod;
      try {
        twitchVod = await db.twitchVods.findVodPlayedDuringPeriodByAccount(
          matchStart,
          matchEnd,
          twitchAccount.id
        );
      } catch (sqlError) {
        this.errors = `SQL Error while finding twitch vod - ${sqlError.message}`;
        return this;
      }
      if (twitchVod === null) {
        continue;
      }

      let twitchVodLolMatchRelation;
      try {
        twitchVodLolMatchRelation =
          await db.lolMatchTwitchVods.findByMatchAndVodId(
            this.matchId,
            twitchVod.id
          );
      } catch (sqlError) {
        this.errors = `SQL Error while finding twitchVodLolMatch relation - ${sqlError.message}`;
        console.error(sqlError);
        return this;
      }
      if (twitchVodLolMatchRelation !== null) {
        continue;
      }

      let durationToMatchStart = dayjs.duration(
        matchStart.diff(twitchVod.started_at)
      );
      let secondsFromVodStartToMatchStart = Math.round(
        durationToMatchStart.as("seconds")
      );

      let vodlink;
      try {
        vodlink = await db.lolMatchTwitchVods.createNew(
          this.matchId,
          twitchVod.id,
          secondsFromVodStartToMatchStart
        );
        createdVodlinks++;
      } catch (sqlError) {
        this.errors = `SQL Error while creating twitchVodLolMatch relation - ${sqlError.message}`;
        console.error(sqlError);
        return this;
      }

      let channelSummoners;
      try {
        channelSummoners = await db.lolSummoners.getAllByTwitchId(
          twitchAccount.id
        );
      } catch (sqlError) {
        this.errors = `SQL Error while getting twitch account - ${sqlError.message}`;
        console.error(sqlError);
        return this;
      }

      for (const summoner of channelSummoners) {
        const participant = matchParticipants.find((p) => {
          return (
            summoner.native_puuid === p.native_puuid &&
            summoner.region?.toUpperCase() === lolMatch.region?.toUpperCase()
          );
        });

        if (participant) {
          try {
            await db.lolMatchParticipant.setVodlinkById(
              vodlink.id,
              participant.id
            );
            updatedLMPs++;
          } catch (sqlError) {
            this.errors = `SQL Error while updating participant vodlinkId VLID ${vodlink?.id} PID ${participant?.id} - ${sqlError.message}`;
            console.error(sqlError);
            return this;
          }
        }
      }
    }

    if (createdVodlinks !== updatedLMPs) {
      this.errors = `Didn't associate the same amount of LMPs as vodlinks created`;
    }

    return this;
  }
}

module.exports = AssociateLolMatchToTwitchVodsJob;
