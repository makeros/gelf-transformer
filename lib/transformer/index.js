'use strict'

const buildStandardGelf = require('./standard-gelf')
const buildExpressMiddlewareGelf = require('./express-gelf')
const buildCustomGelf = require('./custom-gelf')

module.exports = function (opts) {
  return function (data) {
    const standardGelf = buildStandardGelf(data)

    const expressGelf = opts.useExpressMiddlewarePreset
      ? buildExpressMiddlewareGelf(data)
      : {}

    const customGelf = opts.customSchema
      ? buildCustomGelf(data, opts.customSchema)
      : {}
      // return Object.assign({}, standardGelf, expressGelf, customGelf);
      // console.log(standardGelf, expressGelf, customGelf)
    const result = {
      ...standardGelf,
      ...expressGelf,
      ...customGelf
    }
    // console.log(result)

    return result
  }
}
