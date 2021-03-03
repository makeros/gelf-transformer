const Transport = require('./transport')
const { Transform } = require('readable-stream')

module.exports = function processLogs (opts) {
  const streams = []
  if (opts.verbose) {
    streams.push(getVerbose())
  }
  if (opts.transportToGraylog) {
    streams.push(getTransport(opts))
  }
  return streams
}

function getVerbose () {
  return new Transform({
    writableObjectMode: true,
    decodeStrings: false,
    transform: function (data, enc, cb) {
      setImmediate(function () { process.stdout.write(data + '\n') })
      cb()
    }
  })
}

function getTransport (opts) {
  console.log('transport is prepared')
  const transport = new Transport(opts)
  return new Transform({
    writableObjectMode: true,
    decodeStrings: false,
    transform: function (data, enc, cb) {
      setImmediate(function () {
        transport.emit('log', data)
      })
      cb()
    }
  })
}
