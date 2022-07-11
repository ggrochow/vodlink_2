function getFactory(getFn) {
  return async (req, res) => {
    try {
      const results = await getFn(req.query);
      return res.status(200).send(results);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
}

function getResultsFactory(getFn) {
  return async (req, res, next) => {
    try {
      const results = await getFn(req.query);
      res.locals.results = results;
      next();
      return res.status(200).send(results);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
}

function postFactory(postFn) {
  return async (req, res) => {
    try {
      const results = await postFn(req.params, req.body);
      return res.status(200).send(results);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  };
}

module.exports = {
  getFactory,
  getResultsFactory,
  postFactory,
};
