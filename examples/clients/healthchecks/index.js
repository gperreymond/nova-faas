const Client = require('../../..').Client
const client = new Client()

client
  .subscribe('__System.Nova.HealthCheck', (data) => {
    if (data.uuid === client.uuid) { return false }
    console.log(data)
  })
  .start()

client.on('error', error => {
  console.log('client error')
  console.log(error)
})

client.on('ready', () => {
  console.log('client connected')
})
