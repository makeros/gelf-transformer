#! /usr/bin/env node

const program = require('commander')
const path = require('path')
const version = require('./package.json').version
const pinoGelf = require('./lib/pino-gelf')

program
  .version(version)

program
  .command('log')
  .description('Run Pino-GELF')
  .option('-h, --host [host]', 'Graylog Host')
  .option('-p, --port [port]', 'Graylog Port', parseInt)
  .option('-m, --max-chunk-size [maxChunkSize]', 'Graylog Input Maximum Chunk Size', parseInt)
  .option('-e, --use-express-middleware-preset')
  .option('-c, --specify-custom-schema [json file]', 'A JSON file with schema')
  .option('-v, --verbose', 'Output GELF to console')
  .action(function () {
    const opts = {
      customSchema: this.specifyCustomSchema ? require(path.resolve(this.specifyCustomSchema)) : false,
      host: this.host || '127.0.0.1',
      maxChunkSize: this.maxChunkSize || 1420,
      port: this.port || 12201,
      useExpressMiddlewarePreset: this.useExpressMiddlewarePreset || false,
      verbose: this.verbose || false
    }
    pinoGelf(opts)
  })

program
  .parse(process.argv)
