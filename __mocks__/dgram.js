/* globals jest */
const dgram = jest.genMockFromModule('dgram')

dgram.createSocket = jest.fn(() => {
  return {
    send: () => {},
    close: () => {}
  }
})

module.exports = dgram
