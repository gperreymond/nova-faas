const Client = require('../../..').Client
const client = new Client()

client.start()

client.on('error', error => {
  console.log('client error')
  console.log(error)
})

client.on('ready', () => {
  console.log('client connected')
  client.request('BasicNopeQuery', {message: 'This is a query from 02'}, (data) => {
    console.log('result', data)
  })
})
