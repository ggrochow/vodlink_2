const Joi = require("joi");
const { matchupRoles, validRole } = require("./matchupSearch");
const { roleNames } = require("../../database/services/matchupSearch/utils");

const roleCountSchema = Joi.object({
  ...matchupRoles,
})
  .unknown(false)
  .required();

const championCountSchema = Joi.object({
  COUNT_ROLE: Joi.string()
    .valid(...roleNames)
    .required(),
  ROLE: validRole,
  ...matchupRoles,
})
  .unknown(false)
  .required();

module.exports = {
  roleCountSchema,
  championCountSchema,
};
