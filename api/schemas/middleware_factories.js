const validateQueryFactory = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query);
  if (error) {
    return res.status(400).send({ error });
  }

  req.query = value;
  next();
};

const validateBodyFactory = (bodySchema) => (req, res, next) => {
  const { error, value } = bodySchema.validate(req.body);
  if (error) {
    return res.status(400).send({ error });
  }

  req.body = value;

  next();
};

const validateParamsFactory = (paramsSchema) => (req, res, next) => {
  const { error, value } = paramsSchema.validate(req.params);
  if (error) {
    return res.status(400).send({ error });
  }

  req.params = value;
  next();
};

module.exports = {
  validateQueryFactory,
  validateBodyFactory,
  validateParamsFactory,
};
