GELF Transformer (ver. 2)
---
This project is based on [Pino Gelf](https://github.com/pinojs/pino-gelf)

GELF transformer is a tool which receives json formatted logs from the stdin and transforms them into GELF format [GELF](https://docs.graylog.org/en/3.0/pages/gelf.html)
It can also use a custom [mapping schema](###CustomFields)</sup> to fill the output log with more data.


>[![CircleCI](https://circleci.com/gh/makeros/gelf-transformer/tree/master.svg?style=svg)](https://circleci.com/gh/makeros/gelf-transformer/tree/master)


### Contents

* [Installation](##Installation)
* [Usage](##Usage)
* [Getting Started](##GettingStarted)
* [Examples](##Examples)
* [GELF](##GELF)
* [Log Level Mapping](##LogLevelMapping)
* [Acknowledgements](##Acknowledgements)

## Installation

```
npm i -g gelf-transformer
```

## Usage

### Pipeline approach

If your application is pushing logs to the standard output then pipe
them to gelf transformer.
```
node your-app.js | gelf-transformer log <options>
```

## Getting Started

### command `log`

```
gelf-transformer log --help
```

Switch | Description | Default | Notes
---|---|---|---
`-h` | Host | `127.0.0.1` | Graylog server host
`-p` | Port | `12201` | Graylog server port
`-m` | Maximum Chunk Size | `1420` |
`-c` | Custom schema | `false` | You can provide a schema which will define which information from your original logs will be visible in the graylog formatted log
`-v` | Verbose mode | `false` | Output GELF to console
`-t` | Start sending logs to Graylog | `false` | It will start to send logs to the defined graylog server


## Examples

### Custom Fields
Given the log message (formatted as JSON for readability):
```
{
  "pid":16699,
  "hostname":"han",
  "name":"gelf-test-app",
  "level":30,
  "time":1481840140708,
  "msg":"request completed",
  "customField":"test",
  "res":{"statusCode":304},
  "responseTime":8,
  "req":{
    "method":"GET",
    "headers":{
      "host":"localhost:3000",
      "user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14"}
    },
  "v":1
}
```

Given custom schema json file (my_custom_schema.json):
```
{
  "title": "GELF Schema",
  "type": "object",
  "properties": {
    "_status_code": {
      "type": "integer",
      "source": "res.statusCode"
    },
    "_user_agent": {
      "type": "string",
      "source": "req.headers.user-agent"
    },
    "customField": {
      "type": "string"
    }
  }
}

```
__And the usage__:
```
node server.js | gelf-transformer log -v -c my_custom_schema.json
```

Gelf Transformer will show the following message to your Graylog server (formatted here as JSON for readability):
```
{
  "version":"1.1",
  "host":"han",
  "short_message":"request completed",
  "full_message":"request completed",
  "timestamp":1481840140.708,
  "level":6,
  "facility":"gelf-test-app",
  "_status_code":304,
  "_user_agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14",
  "customField":"test"
}
```

## GELF

Right now automatic mapping of fields is done as follows:

Output GELF | Input log | Notes
---|---|---
`version` | `-` | Hardcoded to 1.1 per GELF docs
`host` | `hostname` |
`short_message` | `msg` | This message is truncated to 64 characters
`full_message` | `msg` | msg is not truncated
`timestamp` | `time` |
`level` | `level` | Default level codes from Pino are mapped to SysLog levels<sup>[1](#LogLevelMapping)</sup>
`facility` | `name` | *deprecated*

## Log Level Mapping

### Default behaviour

By default Gelf Transfomer will log level from a [Pino format](https://getpino.io/#/docs/api?id=loggerlevels-object) to syslog format:

Pino Log Level Value | Pino Log Level Name | SysLog Level
---|---|---
10 | Trace | Debug
20 | Debug | Debug
30 | Info | Info
40 | Warn | Warning
50 | Error | Error
60 | Fatal | Critical

__Note:__ A log messages without a level map to SysLog Critical

### Override log level from Schema

*__TBD__*

## Acknowledgements

The implementation of Pino GELF is based in large part on [pino-syslog](https://github.com/jsumners/pino-syslog/) and [gelf-node](https://github.com/robertkowalski/gelf-node).
