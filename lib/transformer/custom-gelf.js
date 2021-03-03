const get = require('lodash.get')

module.exports = function customGelf (properties) {
  return function (data) {
    const _data = {}
    for (const property in properties) {
      _data[property] = get(data, properties[property].source, data[property])
    }
    return _data
  }
}
