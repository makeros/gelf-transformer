/* globals describe, jest, test, expect, afterEach, beforeAll */
const cp = require('child_process')
const path = require('path')

jest.mock('dgram')

const pgPath = path.join(__dirname, '..', 'index.js')

const consoleOutput = function (msg, level) {
  return `{"level":${level},"timestamp":1531171074,"msg":"${msg}","pid":657,"hostname":"box","name":"app","v":1}`
}

describe('gelf-transform in verbose mode', function () {
  let dataSpy

  beforeAll(() => {
    dataSpy = jest.fn(data => data.toString())
  })

  afterEach(() => {
    dataSpy.mockClear()
  })

  test('no logs are processed when non-json message is passed to stdin', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])

    pg.stdout.on('data', () => {
      expect(true).toEqual(false)
      done()
    })

    pg.on('close', (code) => {
      expect(code).toEqual(0)
      done()
    })

    pg.stdin.end('this is not json\n')
  })

  test.only('logger output is transformed to gelf output', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])

    pg.stdout.on('data', dataSpy)

    pg.stdout.on('end', () => {
      expect(dataSpy.mock.results[0].value)
        .toEqual('{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app"}' + '\n')
      pg.kill()
      done()
    })

    pg.stdin.end(consoleOutput('hello world 666', 30) + '\n')
  })

  test('short message is trimmed down', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const msg = 'hello world world world world world world world world world world world world'

    pg.stdout.on('data', dataSpy)

    pg.on('close', () => {
      expect(dataSpy.mock.results[0].value)
        .toEqual(`{"version":"1.1","host":"box","short_message":"hello world world world world world world world world world world","full_message":"${msg}","timestamp":1531171074.631,"level":6,"facility":"app"}` + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(consoleOutput(msg, 30) + '\n')
    pg.stdin.end()
  })

  test('logger output with custom fields (also nested) is transformed to gelf output', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-c', '__mocks__/custom-schema.json', '-v'])
    const consoleCustomOutput = '{"level":30,"time":1531171074.631,"msg":"hello world","nested":{"mock":666},"test2":"red","pid":657,"hostname":"box","name":"app","v":1}'

    pg.stdout.on('data', dataSpy)

    pg.on('close', () => {
      expect(dataSpy.mock.results[0].value)
        .toEqual('{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app","test1":666,"test2":"red"}' + '\n')
      pg.kill()
      done()
    })

    pg.stdin.end(consoleCustomOutput + '\n')
  })

  test('logger output with custom fields should ignore mismatched type fields', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-c', '__mocks__/custom-schema.json', '-v'])
    const consoleCustomOutput = '{"level":30,"time":1531171074.631,"msg":"hello world","nested":{"mock":"this_should_be_a_number"},"test2":222,"pid":657,"hostname":"box","name":"app","v":1}'

    pg.stdout.on('data', dataSpy)

    pg.on('close', () => {
      expect(dataSpy.mock.results[0].value)
        .toEqual('{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app","test2":"222"}' + '\n')
      pg.kill()
      done()
    })

    pg.stdin.end(consoleCustomOutput + '\n')
  })

  test('logger output with custom fields for readme example', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-c', '__mocks__/readme-custom-schema-example.json', '-v'])
    const consoleCustomOutput = '{"pid":16699,"hostname":"han","name":"pino-gelf-test-app","level":30,"time":1481840140708,"msg":"request completed","customField":"test","res":{"statusCode":304},"responseTime":8,"req":{"method":"GET","headers":{"host":"localhost:3000","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14"}},"v":1}'

    pg.stdout.on('data', dataSpy)

    pg.on('close', () => {
      expect(dataSpy.mock.results[0].value)
        .toEqual('{"version":"1.1","host":"han","short_message":"request completed","full_message":"request completed","timestamp":1481840140.708,"level":6,"facility":"pino-gelf-test-app","_status_code":304,"_user_agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14","customField":"test"}' + '\n')
      pg.kill()
      done()
    })

    pg.stdin.end(consoleCustomOutput + '\n')
  })

  test('should output logs delimited with a new line', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const consoleCustomOutput = '{"pid":16699,"hostname":"han","name":"pino-gelf-test-app1","level":30,"time":1481840140708,"msg":"request completed","customField":"test","res":{"statusCode":304},"responseTime":8,"req":{"method":"GET","headers":{"host":"localhost:3000","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14"}},"v":1}'
    const consoleCustomOutput2 = '{"pid":666,"hostname":"han","name":"pino-gelf-test-app2","level":30,"time":1481840140708,"msg":"request completed","customField":"test","res":{"statusCode":304},"responseTime":8,"req":{"method":"GET","headers":{"host":"localhost:3000","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14"}},"v":1}'

    pg.stdout.on('data', dataSpy)

    pg.on('close', () => {
      expect(dataSpy.mock.results.map(i => i.value).join('').match(/[\n]/g).length).toEqual(2)
      done()
      pg.kill()
    })

    pg.stdin.write(consoleCustomOutput + '\n')
    pg.stdin.end(consoleCustomOutput2 + '\n')
  })

  test('should inform that there is no message field in the incomming log', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const dataSpy = jest.fn(data => data.toString())

    pg.stdout.on('data', dataSpy)

    pg.stdout.on('close', () => {
      expect(dataSpy.mock.calls.length).toBe(1)
      expect(dataSpy.mock.results[0].value)
        .toEqual('{"version":"1.1","host":"box","short_message":"No msg property found or msg is empty","full_message":"No msg property found or msg is empty","timestamp":1531171074.631,"level":6,"facility":"app"}' + '\n')
      pg.kill()
      done()
    })

    pg.stdin.end('{"level":30,"time":1531171074.631,"pid":657,"hostname":"box","name":"app","v":1}\n')
  })

  describe('log levels transformations', () => {
    test('pino trace level is transformed to syslog debug level', done => {
      const pg = cp.spawn('node', [pgPath, 'log', '-v'])

      pg.stdout.on('data', dataSpy)

      pg.stdout.on('close', () => {
        expect(dataSpy.mock.results[0].value)
          .toEqual('{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":7,"facility":"app"}' + '\n')
        pg.kill()
        done()
      })

      pg.stdin.end(consoleOutput('hello world', 10) + '\n')
    })

    test('pino debug level is transformed to syslog debug level', done => {
      const pg = cp.spawn('node', [pgPath, 'log', '-v'])

      pg.stdout.on('data', dataSpy)

      pg.stdout.on('close', () => {
        expect(dataSpy.mock.results[0].value)
          .toEqual('{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":7,"facility":"app"}' + '\n')
        pg.kill()
        done()
      })

      pg.stdin.end(consoleOutput('hello world', 20) + '\n')
    })

    test('pino warn level is transformed to syslog warning level', done => {
      const pg = cp.spawn('node', [pgPath, 'log', '-v'])

      pg.stdout.on('data', dataSpy)

      pg.stdout.on('close', () => {
        expect(dataSpy.mock.results[0].value)
          .toEqual('{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":4,"facility":"app"}' + '\n')
        pg.kill()
        done()
      })

      pg.stdin.end(consoleOutput('hello world', 40) + '\n')
    })

    test('pino error level is transformed to syslog error level', done => {
      const pg = cp.spawn('node', [pgPath, 'log', '-v'])

      pg.stdout.on('data', dataSpy)

      pg.stdout.on('close', data => {
        expect(dataSpy.mock.results[0].value)
          .toEqual('{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":3,"facility":"app"}' + '\n')
        pg.kill()
        done()
      })

      pg.stdin.end(consoleOutput('hello world', 50) + '\n')
    })

    test('pino fatal level is transformed to syslog critical level', done => {
      const pg = cp.spawn('node', [pgPath, 'log', '-v'])

      pg.stdout.on('data', dataSpy)

      pg.stdout.on('close', data => {
        expect(dataSpy.mock.results[0].value)
          .toEqual('{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":2,"facility":"app"}' + '\n')
        pg.kill()
        done()
      })

      pg.stdin.end(consoleOutput('hello world', 60) + '\n')
    })

    test('unspecified level is transformed to syslog critical level', done => {
      const pg = cp.spawn('node', [pgPath, 'log', '-v'])

      pg.stdout.on('data', dataSpy)

      pg.stdout.on('close', data => {
        expect(dataSpy.mock.results[0].value)
          .toEqual('{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":2,"facility":"app"}' + '\n')
        pg.kill()
        done()
      })

      pg.stdin.end(consoleOutput('hello world', 666) + '\n')
    })
  })
})
