const winston = require("winston");
const { simple, padLevels, combine } = winston.format;

// Development logger
let logger = winston.createLogger({
  level: "debug",
  format: combine(simple(), padLevels()),
});

if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({ filename: "error.log", level: "error" })
  );
} else {
  // logger.add(new winston.transports.Console({ level: "debug" }));
  logger.add(new winston.transports.Console({ level: "verbose" }));
}

module.exports = logger;
