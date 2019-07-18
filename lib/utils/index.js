const standardSchema = require('./schema/standard')
const expressSchema = require('./schema/express')
const fastJsonStringify = require('fast-json-stringify')
const syslogLevel = require('./syslog')

function pinoLevelToSyslogLevel (pinoLevel) {
  switch (pinoLevel) {
    case 10: // pino: trace
    case 20: // pino: debug
      return syslogLevel.debug
    case 30: // pino: info
      return syslogLevel.info
    case 40: // pino: warn
      return syslogLevel.warning
    case 50: // pino: error
      return syslogLevel.error
    default:
    case 60: // pino: fatal
      return syslogLevel.critical
  }
}

const stringify = function (opts) {
  const schema = standardSchema

  if (opts.useExpressMiddlewarePreset) {
    schema.properties = Object.assign(schema.properties, expressSchema.properties)
  }

  if (opts.customSchema) {
    schema.properties = Object.assign(schema.properties, opts.customSchema.properties)
  }

  return fastJsonStringify(schema)
}

module.exports = {
  pinoLevelToSyslogLevel: pinoLevelToSyslogLevel,
  stringify: stringify
}
