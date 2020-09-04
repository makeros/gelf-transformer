const buildStandardGelf = require('./standard-gelf')
const buildCustomGelf = require('./custom-gelf')

module.exports = function (opts) {
  const sanitizeData = setMessageField(opts)

  return function (data) {
    return {
      ...buildStandardGelf(sanitizeData(data)),
      ...opts.customSchema ? buildCustomGelf(data, opts.customSchema) : {}
    }
  }
}

function setMessageField (opts) {
  return function (data) {
    data.msg = data[opts.messageField] ? data[opts.messageField] : 'No msg property found or msg is empty'
    return data
  }
}
