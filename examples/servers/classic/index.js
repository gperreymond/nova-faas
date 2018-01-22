const Server = require('../../..').Server
const server = new Server()

server.start()

server.on('error', error => {
  console.log('server error')
  console.log(error)
})

server.on('ready', () => {
  console.log('server connected')
})
