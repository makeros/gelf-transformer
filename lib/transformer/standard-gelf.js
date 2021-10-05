const utils = require('./../utils')

module.exports = function (data) {
  return {
    version: '1.1',
    host: data.host,
    short_message: data.msg.substring(0, 65),
    full_message: data.msg,
    timestamp: data.timestamp,
    level: utils.pinoLevelToSyslogLevel(data.level),
    facility: data.name // deprecated
  }
}
