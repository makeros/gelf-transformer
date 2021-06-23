/* globals describe, it, expect, afterEach, beforeEach */
const cp = require('child_process')
const path = require('path')
const { unzip } = require('zlib')
const mockServer = require(path.resolve('__mocks__/udp-server.js'))

const gtPath = path.join(__dirname, '..', 'index.js')

describe('gelf-transform in transport mode', function () {
  let server
  let gelfTransformer
  beforeEach(() => {
    gelfTransformer = cp.spawn('node', [gtPath, 'log', '-t'])
    server = mockServer.start()
  })

  afterEach((done) => {
    mockServer.stop(function () {
      gelfTransformer.kill()
      done()
    })
  })

  it('should send logs to the graylog server when transport is enabled', done => {
    const result = []
    let callsCounter = 0
    server.on('message', (msg, remote) => {
      unzip(msg, function (err, buffer) {
        if (err) {
          return done(err)
        }

        result.push(buffer.toString())
        callsCounter++

        if (callsCounter === 2) {
          expect(result[0]).toEqual('{"version":"1.1","host":"box","short_message":"log1","full_message":"log1","timestamp":1531171074.631,"level":6,"facility":"app"}')
          expect(result[1]).toEqual('{"version":"1.1","host":"box","short_message":"log2","full_message":"log2","timestamp":1531171074.631,"level":6,"facility":"app"}')
          done()
        }
      })
    })

    gelfTransformer.stdin.write('{"level":30,"time":1531171074631,"msg":"log1","pid":657,"hostname":"box","name":"app","v":1}' + '\n')
    gelfTransformer.stdin.write('{"level":30,"time":1531171074631,"msg":"log2","pid":657,"hostname":"box","name":"app","v":1}' + '\n')
  }, 10000)
})
