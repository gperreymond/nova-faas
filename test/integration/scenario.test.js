const path = require('path')
const expect = require('chai').expect
const Server = require('../..').Server
const Client = require('../..').Client

describe('[integration] the client', () => {
  it('should subscibe to a fail send command', done => {
    const server = new Server()
    server
      .use(path.resolve(__dirname, '../data/commands/*.js'))
      .start()
    server.on('error', error => {
      done(error)
    })
    server.on('ready', () => {
      expect(server.uuid).to.be.a('string')
      const client = new Client()
      client
        .subscribe('BasicNopeCommand.Error', (event) => {
          expect(event.type).to.equal('Command')
          expect(event.name).to.equal('BasicNopeCommand')
          expect(event.event).to.equal('BasicNopeCommand.Error')
          expect(event.params.message).to.equal('This is a bad test')
          expect(event.params.data).to.equal(true)
          client.close()
          server.close()
          done()
        })
        .start()
      client.on('error', error => {
        done(error)
      })
      client.on('ready', () => {
        client.send('BasicNopeCommand', {message: 'This is a bad test', data: true})
      })
    })
  })
  it('should subscibe to a success send query', done => {
    const server = new Server()
    server
      .use(path.resolve(__dirname, '../data/queries/*.js'))
      .start()
    server.on('error', error => {
      done(error)
    })
    server.on('ready', () => {
      expect(server.uuid).to.be.a('string')
      const client = new Client()
      client
        .subscribe('BasicNopeQuery.Success', (event) => {
          expect(event.type).to.equal('Query')
          expect(event.name).to.equal('BasicNopeQuery')
          expect(event.event).to.equal('BasicNopeQuery.Success')
          expect(event.params.message).to.equal('This is a good test')
          expect(event.params.data).to.equal(true)
          expect(event.result.data).to.equal(true)
          client.close()
          server.close()
          done()
        })
        .start()
      client.on('error', error => {
        done(error)
      })
      client.on('ready', () => {
        client.send('BasicNopeQuery', {message: 'This is a good test', data: true})
      })
    })
  })
  it('should subscibe to a success request query', done => {
    const server = new Server()
    server
      .use(path.resolve(__dirname, '../data/queries/*.js'))
      .start()
    server.on('error', error => {
      done(error)
    })
    server.on('ready', () => {
      expect(server.uuid).to.be.a('string')
      const client = new Client()
      client
        .start()
      client.on('error', error => {
        done(error)
      })
      client.on('ready', () => {
        client.request('BasicNopeQuery', {message: 'This is a good test', data: true}, data => {
          expect(data.type).to.equal('Query')
          expect(data.name).to.equal('BasicNopeQuery')
          expect(data.event).to.equal('BasicNopeQuery.Success')
          expect(data.params.message).to.equal('This is a good test')
          expect(data.params.data).to.equal(true)
          expect(data.result.data).to.equal(true)
          client.close()
          server.close()
          done()
        })
      })
    })
  })
})
