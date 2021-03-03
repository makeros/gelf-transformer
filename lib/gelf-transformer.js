const fastJsonParse = require('fast-json-parse')
const processLogs = require('./process-logs')
const streamLogs = require('./stream-logs')
const split = require('split2')
const { pipeline } = require('readable-stream')

module.exports = function (opts) {
  pipeline(
    process.stdin,
    split(fastJsonParse),
    processLogs(opts),
    ...streamLogs(opts)
  )
  process.on('SIGINT', function () { process.exit(0) })
}
