function queryParamsExtractor(req) {
  const params = [];
  const orderedKeys = Object.keys(req.query).sort();
  for (const key of orderedKeys) {
    params.push(`${key}=${req.query[key]}|`);
  }

  return params.join("|");
}

module.exports = queryParamsExtractor;
