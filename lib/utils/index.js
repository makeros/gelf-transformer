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
function pinoLevelToSyslogLevel (level) {
  return mapPinoToSyslogLevel[level]
}

const stringify = function (opts) {
  const schema = standardSchema
  if (opts.customSchema) {
    schema.properties = Object.assign(schema.properties, opts.customSchema.properties)
  }

  return fastJsonStringify(schema)
}

module.exports = {
  pinoLevelToSyslogLevel: pinoLevelToSyslogLevel,
  stringify: stringify
}
