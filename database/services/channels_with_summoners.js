const db = require("../models");

async function getAllChannelsWithSummoners() {
  const channels = await db.twitchAccounts.getAll();
  const summoners = await db.lolSummoners.getAll();

  return channels.map((channel) => {
    channel.summoners = summoners.filter(
      (summoner) => summoner.twitch_channel_id === channel.id
    );

    return {
      id: channel.id,
      channelName: channel.display_name,
      login: channel.channel_name,
      summoners: channel.summoners.map((summoner) => {
        return {
          summonerName: summoner.summoner_name,
          region: summoner.region,
          id: summoner.id,
        };
      }),
    };
  });
}

module.exports = {
  getAllChannelsWithSummoners,
};
