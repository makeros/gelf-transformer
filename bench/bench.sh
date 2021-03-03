#!/bin/bash
time node producer.js 1000000 | node --trace-uncaught ../index.js log -c ../__mocks__/custom-schema.json -v