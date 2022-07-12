const logger = require("../../utils/logger");

function requireAuthFactory(authToken, tokenKey) {
  return (req, res, next) => {
    const reqAuthTokenString = req?.headers?.[tokenKey];
    if (!reqAuthTokenString) {
      return res.sendStatus(401);
    }

    // 'TOKEN #########'
    if (reqAuthTokenString.slice(0, 6) !== "TOKEN ") {
      return res.sendStatus(403);
    }

    if (!authToken) {
      logger.error(`No ${tokenKey} authToken set`);
      return res.sendStatus(500);
    }

    if (reqAuthTokenString.slice(6) !== authToken) {
      return res.sendStatus(403);
    }

    next();
  };
}

const requireAuthHeader = requireAuthFactory(
  process.env.AUTH_TOKEN,
  "authorization"
);
const requireAdminAuthHeader = requireAuthFactory(
  process.env.ADMIN_AUTH_TOKEN,
  "admin_authorization"
);

module.exports = {
  requireAuthHeader,
  requireAdminAuthHeader,
};
