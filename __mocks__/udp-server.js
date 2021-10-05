/* globals jest */
const PORT = 12201
const HOST = '127.0.0.1'

const dgram = require('dgram')
let server

const onMessage = jest.fn()

function start () {
  server = dgram.createSocket('udp4')
  server.on('message', onMessage)
  server.bind(PORT, HOST)
  return server
}

function stop (cb) {
  server.close(function () {
    onMessage.mockReset()
    cb && cb()
  })
}

module.exports = {
  onMessage,
  start,
  stop
}
