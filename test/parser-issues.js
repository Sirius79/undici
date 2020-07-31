const net = require('net')
const { test } = require('tap')
const { Client } = require('..')

test('https://github.com/mcollina/undici/issues/268', (t) => {
  t.plan(2)

  const server = net.createServer(socket => {
    socket.write('HTTP/1.1 200 OK\r\n')
    socket.write('Connection: Keep-Alive\r\n')
    socket.write('Transfer-Encoding: chunked\r\n\r\n')
    setTimeout(() => {
      socket.write('1\r\n')
      socket.write('\n')
      setTimeout(() => {
        socket.write('1\r\n')
        socket.write('\n')
      }, 500)
    }, 500)
  })
  t.tearDown(server.close.bind(server))

  server.listen(0, () => {
    const client = new Client(`http://localhost:${server.address().port}`, {
      headersTimeout: 1e3
    })
    t.tearDown(client.destroy.bind(client))

    client.request({
      method: 'GET',
      path: '/nxt/_changes?feed=continuous&heartbeat=5000'
    }, (err, data) => {
      t.error(err)
      data.body
        .resume()
      setTimeout(() => {
        t.pass()
        data.body.on('error', () => {})
      }, 2e3)
    })
  })
})
