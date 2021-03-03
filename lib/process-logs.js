const transformer = require('./transformer')
const { stringify } = require('./utils')
const { Transform } = require('readable-stream')

module.exports = function processLogs (opts) {
  const transform = transformer(opts)
  const stringified = stringify(opts)

  return new Transform({
    writableObjectMode: true,
    decodeStrings: false,
    transform: function (data, enc, cb) {
      if (data.value !== null) {
        this.push(stringified(transform(data.value)))
      }
      cb()
    },
    construct (callback) {
      this.data = ''
      callback()
    },
    flush (callback) {
      try {
        this.push('')
      } catch (err) {
        callback(err)
      }
    }
  })
}
