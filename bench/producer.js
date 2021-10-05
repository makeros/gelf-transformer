'use strict'

for (let i = 0; i < process.argv.slice(2)[0]; i++) {
  process.stdout.write('{"level":30,"time":1531171074631,"msg":"hello world","nested":{"mock":666},"test2":"red","pid":657,"hostname":"box","name":"app","v":1}' + '\n')
}
