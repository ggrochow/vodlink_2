const validateReqKeyFactory = (key) => (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req[key]);
  if (error) {
    return res.status(400).send({ error });
  }

  req[key] = value;
  next();
};

const validateQueryFactory = validateReqKeyFactory("query");
const validateBodyFactory = validateReqKeyFactory("body");
const validateParamsFactory = validateBodyFactory("params");

module.exports = {
  validateQueryFactory,
  validateBodyFactory,
  validateParamsFactory,
};
