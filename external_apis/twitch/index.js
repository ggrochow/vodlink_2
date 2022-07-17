const axios = require("axios");
const NEW_API_BASE_URL = "https://api.twitch.tv/helix";
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

function getAccessToken() {
  const url = `https://id.twitch.tv/oauth2/token`;
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "client_credentials");

  return axios.post(url, params);
}

function getUserInfoFromChannelName(channelName, authToken) {
  let url = `${NEW_API_BASE_URL}/users`;
  let queryParams = { login: channelName };

  return request(url, queryParams, authToken);
}

function getUserInfoFromNativeId(nativeId, authToken) {
  let url = `${NEW_API_BASE_URL}/users`;
  let queryParams = { id: nativeId };

  return request(url, queryParams, authToken);
}

function getVodsForChannel(nativeChannelId, authToken, cursor) {
  let url = `${NEW_API_BASE_URL}/videos`;

  let queryParams = {
    user_id: nativeChannelId,
    first: 100,
    type: "archive",
  };
  if (cursor !== undefined) {
    queryParams.after = cursor;
  }

  return request(url, queryParams, authToken);
}

function getVodById(vodId, authToken) {
  let url = `${NEW_API_BASE_URL}/videos`;
  let queryParams = {
    id: vodId,
  };

  return request(url, queryParams, authToken);
}

function request(url, params, authToken) {
  let options = {
    url,
    params,
    headers: {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${authToken}`,
    },
  };

  return axios.request(options);
}

module.exports = {
  getUserInfoFromChannelName,
  getUserInfoFromNativeId,
  getVodsForChannel,
  getVodById,
  getAccessToken,
};
