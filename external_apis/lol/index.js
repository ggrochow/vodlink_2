const axios = require("axios");
const API_KEY = process.env["LOL_API_KEY"];
const logger = require("../../utils/logger");

function baseUrl(regionCode) {
  return `https://${regionCode}.api.riotgames.com`;
}

function v5BaseUrl(regionCode) {
  let region;
  switch (regionCode.toUpperCase()) {
    case "BR1":
    case "LA1":
    case "LA2":
    case "NA1":
      region = "americas";
      break;

    case "EUN1":
    case "EUW1":
    case "RU":
      region = "europe";
      break;

    case "JP1":
    case "KR":
    case "OC1":
      region = "asia";
      break;

    default:
      logger.error("unrecognized region code in v5BaseURl", regionCode);
  }

  return `https://${region}.api.riotgames.com`;
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

function getMatchesForAccountInPeriod(region, puuid, startTime, endTime) {
  let url = `${v5BaseUrl(region)}/lol/match/v5/matches/by-puuid/${puuid}/ids`;
  let params = {
    startTime,
    endTime,
    queue: 420, // ranked
  };

  return request(url, params);
}

function getMatchInfoById(region, matchId) {
  let url = `${v5BaseUrl(region)}/lol/match/v5/matches/${matchId}`;

  return request(url);
}

module.exports = {
  getAccountInfoFromSummonerName,
  getMatchesForAccountInPeriod,
  getMatchInfoById,
  API_KEY,
};
