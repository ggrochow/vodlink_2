const Joi = require("joi");
const { DB_LOL_ROLES } = require("../../utils/lol_data");

const matchupRoles = {
  ALLY_TOP: Joi.number().integer().min(1),
  ALLY_MIDDLE: Joi.number().integer().min(1),
  ALLY_BOTTOM: Joi.number().integer().min(1),
  ALLY_UTILITY: Joi.number().integer().min(1),
  ALLY_JUNGLE: Joi.number().integer().min(1),
  ENEMY_TOP: Joi.number().integer().min(1),
  ENEMY_MIDDLE: Joi.number().integer().min(1),
  ENEMY_BOTTOM: Joi.number().integer().min(1),
  ENEMY_UTILITY: Joi.number().integer().min(1),
  ENEMY_JUNGLE: Joi.number().integer().min(1),
};

const validRole = Joi.string().valid(...DB_LOL_ROLES);

const fullMatchupSearchSchema = Joi.object({
  PAGE: Joi.number().integer().min(1),
  ROLE: validRole,
  ...matchupRoles,
})
  .unknown(false)
  .required();

module.exports = {
  fullMatchupSearchSchema,
  matchupRoles,
  validRole,
};
