#! /usr/bin/env node

const program = require('commander')
const path = require('path')
const version = require('./package.json').version
const gelfTransformer = require('./lib/gelf-transformer')

program
  .version(version)

program
  .command('log')
  .description('Run Gelf-Transformer')
  .option('-h, --host [host]', 'Graylog Host')
  .option('-p, --port [port]', 'Graylog Port', parseInt)
  .option('-m, --max-chunk-size [maxChunkSize]', 'Graylog Input Maximum Chunk Size', parseInt)
  .option('-c, --specify-custom-schema [json file]', 'A JSON file with schema')
  .option('-v, --verbose', 'Output GELF to console')
  .option('-t, --transport-to-graylog', 'Start sending logs to Graylog')
  .action(function () {
    const opts = {
      customSchema: this.specifyCustomSchema ? require(path.resolve(this.specifyCustomSchema)) : false,
      host: this.host || '127.0.0.1',
      maxChunkSize: this.maxChunkSize || 1420,
      port: this.port || 12201,
      verbose: this.verbose || false,
      transportToGraylog: this.transportToGraylog || false,
      messageField: 'msg'
    }
    gelfTransformer(opts)
  })

program
  .parse(process.argv)
