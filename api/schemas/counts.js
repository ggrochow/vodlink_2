const Joi = require("joi");
const { DB_LOL_ROLES } = require("../../utils/lol_data");

const roleCountSchema = Joi.object({
  championId: Joi.number(),
});

const championCountSchema = Joi.object({
  role: Joi.string().valid(...DB_LOL_ROLES),
});

const enemyChampionCountSchema = Joi.object({
  role: Joi.string(),
  championId: Joi.number(),
});

module.exports = {
  roleCountSchema,
  championCountSchema,
  enemyChampionCountSchema,
};
