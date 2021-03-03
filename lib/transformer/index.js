const buildStandardGelf = require('./standard-gelf')
const buildCustomGelf = require('./custom-gelf')

module.exports = function (opts) {
  const sanitizeData = setMessageField(opts)
  const customProperties = opts.customSchema ? opts.customSchema.properties : {}
  const build = buildCustomGelf(customProperties)
  return function (value) {
    return Object.assign(buildStandardGelf(sanitizeData(value)), build(value))
  }
}

function setMessageField (opts) {
  const _field = opts.messageField
  return function (data) {
    data.msg = data[_field] !== undefined ? data[_field] : 'No msg property found or msg is empty'
    return data
  }
}
