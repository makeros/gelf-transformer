/* globals describe, test, expect, afterEach, beforeEach */
const cp = require('child_process')
const path = require('path')
const { unzip } = require('zlib')
const mockServer = require(path.resolve('__mocks__/udp-server.js'))

const gtPath = path.join(__dirname, '..', 'index.js')

function logsOutput (msg, level) {
  return `{"level":${level},"time":1531171074631,"msg":"${msg}","pid":657,"hostname":"box","name":"app","v":1}`
}

describe('gelf-transform in transport mode', function () {
  let server
  beforeEach(() => {
    server = mockServer.start()
  })

  afterEach(() => {
    mockServer.stop()
  })

  test('should send logs to the graylog server when transport is enabled', done => {
    const gt = cp.spawn('node', [gtPath, 'log', '-t'])

    server.on('message', (msg, remote) => {
      unzip(msg, function (err, buffer) {
        if (err) {
          gt.kill()
          return done(err)
        }

        const result = buffer.toString()
        expect(mockServer.onMessage).toBeCalledTimes(1)
        expect(result).toEqual('{"version":"1.1","host":"box","short_message":"log","full_message":"log","timestamp":1531171074.631,"level":6,"facility":"app"}')

        gt.kill()
        done()
      })
    })

    gt.stdin.write(logsOutput('log', '30') + '\n')
  })

  test('should not send logs to graylog', done => {
    const gt = cp.spawn('node', [gtPath, 'log'])
    const gtLog = cp.spawn('node', [gtPath, 'log', '-t'])

    server.on('message', (msg, remote) => {
      unzip(msg, function (err, buffer) {
        if (err) {
          gt.kill()
          gtLog.kill()
          return done(err)
        }

        const result = buffer.toString()
        expect(mockServer.onMessage).toBeCalledTimes(1)
        expect(result).toEqual('{"version":"1.1","host":"box","short_message":"available","full_message":"available","timestamp":1531171074.631,"level":6,"facility":"app"}')
        gt.kill()
        gtLog.kill()
        done()
      })
    })

    gt.stdin.write(logsOutput('not_available', '30') + '\n')
    gtLog.stdin.write(logsOutput('available', '30') + '\n')
  })
})
