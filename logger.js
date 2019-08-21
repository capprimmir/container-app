const {
  createLogger,
  format,
  transports
} = require('winston');

//const env = process.env.NODE_ENV || 'development';
const env = process.env.NODE_ENV || 'production';

const logformat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf(
    info => `${info.timestamp} ${info.level} ${info.message}`
  )
)
module.exports = createLogger({
  format: logformat,
  transports: [
    new transports.Console({
      level: env === 'development' ? 'debug' : 'info'
    })
  ]
})