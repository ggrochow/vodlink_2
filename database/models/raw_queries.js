/*
    Various database utility functions
 */
const logger = require("../../utils/logger");
const pgp = require("pg-promise")();
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

// Avoid getting timezones into our PG DateTime return values, instead return a dayjs object with UTC;
// https://github.com/brianc/node-postgres/issues/429#issuecomment-24870258
// https://github.com/vitaly-t/pg-promise/issues/130
pgp.pg.types.setTypeParser(1114, function (strValue) {
  return dayjs.utc(strValue);
});

const db = pgp({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

function none(text, params) {
  logger.debug(`db.none SQL: ${pgp.as.format(text, params)}`);
  return db.none(text, params);
}

function one(text, params) {
  logger.debug(`db.one SQL: ${pgp.as.format(text, params)}`);
  return db.one(text, params);
}

function oneOrNone(text, params) {
  logger.debug(`db.oneOrNone SQL: ${pgp.as.format(text, params)}`);
  return db.oneOrNone(text, params);
}

function many(text, params) {
  logger.debug(`db.many SQL: ${pgp.as.format(text, params)}`);
  return db.many(text, params);
}

function manyOrNone(text, params) {
  logger.debug(`db.manyOrNone SQL: ${pgp.as.format(text, params)}`);
  return db.manyOrNone(text, params);
}

module.exports = {
  none,
  one,
  oneOrNone,
  many,
  manyOrNone,
};
