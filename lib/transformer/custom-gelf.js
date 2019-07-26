const _ = require('lodash')

module.exports = function (data, customSchema) {
  return Object.entries(customSchema.properties)
    .reduce((acc, entry) => {
      const sourcePath = entry[1].source ? entry[1].source : entry[0]
      acc[entry[0]] = _.get(data, sourcePath, undefined)
      return acc
    }, {})
}
