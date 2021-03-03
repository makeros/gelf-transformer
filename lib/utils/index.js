const standardSchema = require('./../schema/gelf')
const fastJsonStringify = require('fast-json-stringify')
const syslogLevel = require('./syslog')

// to syslog level can be configurable
const mapPinoToSyslogLevel = {
  10: syslogLevel.debug,
  20: syslogLevel.debug,
  30: syslogLevel.info,
  40: syslogLevel.warning,
  50: syslogLevel.error,
  60: syslogLevel.critical
}

exports.pinoLevelToSyslogLevel = function pinoLevelToSyslogLevel (level) {
  return mapPinoToSyslogLevel[level] || syslogLevel.critical
}

exports.stringify = function stringify (opts) {
  if (opts.customSchema) {
    Object.assign(standardSchema.properties, opts.customSchema.properties)
  }

  return fastJsonStringify(standardSchema)
}
