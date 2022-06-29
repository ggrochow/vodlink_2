const Joi = require("joi");

const addChannelsWithSummonersSchema = Joi.object({
  twitchName: Joi.string().required(),
  lolAccounts: Joi.array().items(
    Joi.object({
      region: Joi.string().required(),
      name: Joi.string().required(),
    })
      .min(1)
      .required()
  ),
}).required();

module.exports = {
  addChannelsWithSummonersSchema,
};
