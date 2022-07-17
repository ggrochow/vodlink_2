const axios = require("axios");
const logger = require("../../utils/logger");
const VODLINK_HOMEPAGE_BASE_URL = "https://lol.vodfind.com";
const REFRESH_TOKEN = process.env.REVALIDATE_TOKEN;

function revalidateHomepage() {
  if (process.env.NODE_ENV !== "production") {
    logger.verbose("not revalidating homepage on non-production");
    return;
  }

  const url = `${VODLINK_HOMEPAGE_BASE_URL}/api/reindex`;
  const queryParams = {
    secret: REFRESH_TOKEN,
  };

  return axios.get(url, queryParams);
}

module.exports = {
  revalidateHomepage,
};
