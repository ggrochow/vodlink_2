const getCacheFactory = require("./getCacheFactory");
const setCacheFactory = require("./setCacheFactory");
const {
  requireAuthHeader,
  requireAdminAuthHeader,
} = require("./requireAuthHeader");

const {
  validateQueryFactory,
  validateBodyFactory,
  validateParamsFactory,
} = require("./schemas");

module.exports = {
  getCacheFactory,
  setCacheFactory,
  validateBodyFactory,
  validateParamsFactory,
  requireAuthHeader,
  validateQueryFactory,
  requireAdminAuthHeader,
};
