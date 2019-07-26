const buildStandardGelf = require('./standard-gelf')
const buildCustomGelf = require('./custom-gelf')

module.exports = function (opts) {
  return function (data) {
    const standardGelf = buildStandardGelf(data)

    const customGelf = opts.customSchema
      ? buildCustomGelf(data, opts.customSchema)
      : {}

    const result = {
      ...standardGelf,
      ...customGelf
    }

    return result
  }
}
