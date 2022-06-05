const axios = require("axios");
const API_KEY = process.env["LOL_API_KEY"];

function baseUrl(regionCode) {
  return `https://${regionCode}.api.riotgames.com`;
}

function request(url, params = {}) {
  let options = {
    url,
    params,
    headers: {
      "X-Riot-Token": API_KEY,
    },
  };

  return axios.request(options);
}

function getAccountInfoFromSummonerName(region, summonerName) {
  let url = `${baseUrl(
    region
  )}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;

  return request(url);
}

function getMatchesForAccountInPeriod(region, accountId, beginTime, endTime) {
  let url = `${baseUrl(
    region
  )}/lol/match/v4/matchlists/by-account/${accountId}`;
  let params = {
    beginTime,
    endTime,
  };

  return request(url, params);
}

function getMatchInfoById(region, matchId) {
  let url = `${baseUrl(region)}/lol/match/v4/matches/${matchId}`;

  return request(url);
}

module.exports = {
  getAccountInfoFromSummonerName,
  getMatchesForAccountInPeriod,
  getMatchInfoById,
  API_KEY,
};
