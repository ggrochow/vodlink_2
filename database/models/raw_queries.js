/*
    Various database utility functions
 */
const logger = require("../../utils/logger");
const pgPromise = require("pg-promise");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const pgpInitOptions = {
  query: (e) => logger.debug(e.query),
};
const pgp = pgPromise(pgpInitOptions);

// Avoid getting timezones into our PG DateTime return values, instead return a dayjs object with UTC;
// https://github.com/brianc/node-postgres/issues/429#issuecomment-24870258
// https://github.com/vitaly-t/pg-promise/issues/130
pgp.pg.types.setTypeParser(1114, function (strValue) {
  return dayjs.utc(strValue);
});

const pgpOptions = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
};

const db = pgp(pgpOptions);

module.exports = db;
