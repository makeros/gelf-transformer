/* globals describe, jest, test, expect */
const cp = require('child_process')
const path = require('path')

jest.mock('dgram')

const pgPath = path.join(__dirname, '..', 'index.js')

function pinoOutput (msg, level) {
  return `{"level":${level},"time":1531171074631,"msg":"${msg}","pid":657,"hostname":"box","name":"app","v":1}`
}

describe('pinoGelf in verbose mode', function () {
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

  test('pino output is transformed to gelf output', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoOutput('hello world', 30) + '\n')
  })

  test('short message is trimmed down', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const msg = 'hello world world world world world world world world world world world world'
    const expected = `{"version":"1.1","host":"box","short_message":"hello world world world world world world world world world world","full_message":"${msg}","timestamp":1531171074.631,"level":6,"facility":"app"}`

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoOutput(msg, 30) + '\n')
  })

  test('pino trace level is transformed to syslog debug level', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":7,"facility":"app"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoOutput('hello world', 10) + '\n')
  })

  test('pino debug level is transformed to syslog debug level', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":7,"facility":"app"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoOutput('hello world', 20) + '\n')
  })

  test('pino warn level is transformed to syslog warning level', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":4,"facility":"app"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoOutput('hello world', 40) + '\n')
  })

  test('pino error level is transformed to syslog error level', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":3,"facility":"app"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoOutput('hello world', 50) + '\n')
  })

  test('pino fatal level is transformed to syslog critical level', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":2,"facility":"app"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoOutput('hello world', 60) + '\n')
  })

  test('unspecified level is transformed to syslog critical level', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":2,"facility":"app"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoOutput('hello world', 60) + '\n')
  })

  test('pino output with express-pino-middleware option is transformed to gelf output', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-e', '-v'])
    const pinoExpressOutput = '{"level":30,"time":1531171074631,"msg":"hello world","res":{"statusCode":304,"header":"HTTP/1.1 304 Not Modified"},"responseTime":8,"req":{"method":"GET","url":"/","headers":{"accept":"text/html"}},"pid":657,"hostname":"box","name":"app","v":1}'
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app","req":{"method":"GET","url":"/","headers":"{\\"accept\\":\\"text/html\\"}"},"res":{"statusCode":304,"header":"\\"HTTP/1.1 304 Not Modified\\""},"responseTime":8}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoExpressOutput + '\n')
  })

  test('pino output with custom fields (also nested) is transformed to gelf output', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-c', '__mocks__/custom-schema.json', '-v'])
    const pinoCustomOutput = '{"level":30,"time":1531171074631,"msg":"hello world","nested":{"mock":666},"test2":"red","pid":657,"hostname":"box","name":"app","v":1}'
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app","test1":666,"test2":"red"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoCustomOutput + '\n')
  })

  test('pino output with custom fields should ignore mismatched type fields', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-c', '__mocks__/custom-schema.json', '-v'])
    const pinoCustomOutput = '{"level":30,"time":1531171074631,"msg":"hello world","nested":{"mock":"this_should_be_a_number"},"test2":222,"pid":657,"hostname":"box","name":"app","v":1}'
    const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app","test2":"222"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })

    pg.stdin.write(pinoCustomOutput + '\n')
  })

  test('pino output with custom fields for readme example', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-c', '__mocks__/readme-custom-schema-example.json', '-v'])
    const pinoCustomOutput = '{"pid":16699,"hostname":"han","name":"pino-gelf-test-app","level":30,"time":1481840140708,"msg":"request completed","customField":"test","res":{"statusCode":304},"responseTime":8,"req":{"method":"GET","headers":{"host":"localhost:3000","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14"}},"v":1}'
    const expected = '{"version":"1.1","host":"han","short_message":"request completed","full_message":"request completed","timestamp":1481840140.708,"level":6,"facility":"pino-gelf-test-app","_status_code":304,"_user_agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14","customField":"test"}'

    pg.stdout.on('data', data => {
      expect(data.toString()).toEqual(expected + '\n')
      pg.kill()
      done()
    })
    pg.stdin.write(pinoCustomOutput + '\n')
  })

  test('should output logs delimited with a new line', done => {
    const pg = cp.spawn('node', [pgPath, 'log', '-v'])
    const pinoCustomOutput = '{"pid":16699,"hostname":"han","name":"pino-gelf-test-app","level":30,"time":1481840140708,"msg":"request completed","customField":"test","res":{"statusCode":304},"responseTime":8,"req":{"method":"GET","headers":{"host":"localhost:3000","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14"}},"v":1}'
    let result = ''
    pg.stdout.on('data', data => {
      result += data.toString()
      // expect(dataStr.split(pinoCustomOutput)[1]).toEqual('\n')
    })

    pg.on('close', () => {
      const newLines = result.match(/[\n]/g)
      expect(newLines.length).toEqual(2)
      done()
      pg.kill()
    })

    pg.stdin.write(pinoCustomOutput + '\n')
    pg.stdin.write(pinoCustomOutput + '\n')
    pg.stdin.end()
  })
})
