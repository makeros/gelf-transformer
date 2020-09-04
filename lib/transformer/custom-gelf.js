const get = require('lodash.get')

module.exports = function (data, customSchema) {
  return Object.entries(customSchema.properties)
    .reduce((acc, entry) => {
      const sourcePath = entry[1].source ? entry[1].source : entry[0]
      acc[entry[0]] = get(data, sourcePath, undefined)
      return acc
    }, {})
}
