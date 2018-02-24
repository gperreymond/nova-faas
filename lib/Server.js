const uuid = require('uuid')
const EventEmitter = require('events').EventEmitter
const util = require('util')
const path = require('path')
const _ = require('lodash')
const glob = require('glob-promise')
let servicebus = require('servicebus')

const Command = require('./Command')
const Query = require('./Query')
const NovaError = require('./utils/NovaError')
const novaError = new NovaError()

const receiver = function (context, name, handler) {
  context.debug('receiver %s has been added', name)
  context.__receivers[name] = handler
  return context
}

class Server {
  constructor () {
    this.debug = require('debug')('nova:server')
    this.uuid = uuid.v4()
    this.starttime = Date.now()
    this.informations = {}
    this.__receivers = {}
    EventEmitter.call(this)
  }
  use (dirpath) {
    this.debug('use %s', dirpath)
    const files = glob.sync(dirpath)
    files.map(filepath => {
      let name = _.upperFirst(_.camelCase(path.basename(filepath, '.js')))
      let type = 'None'
      if (name.indexOf('Command') !== -1) { type = 'Command' }
      if (name.indexOf('Query') !== -1) { type = 'Query' }
      if (type === 'Command') receiver(this, name, new Command(name, require(filepath)))
      if (type === 'Query') receiver(this, name, new Query(name, require(filepath)))
    })
    return this
  }
  start (options) {
    this.debug('start')
    this.options = this.options = Object.assign({
      host: 'localhost',
      port: 5672,
      user: 'guest',
      pass: 'guest',
      timeout: 2000,
      heartbeat: 10,
      queuesFile: `.queues.${this.uuid}`
    }, options)
    this.options.url = `amqp://${this.options.user}:${this.options.pass}@${this.options.host}:${this.options.port}`
    this.bus = servicebus.bus(this.options)
    this.bus.on('error', error => {
      this.emit('error', novaError.log('internal_error', {uuid: this.uuid, type: 'Server', name: 'Server', error}))
    })
    this.bus.on('ready', () => {
      // healthcheck events over the bus
      setInterval(() => { this.healthcheck() }, 1000)
      this.bus.subscribe('__System.Nova.HealthCheck', message => this.healthcheckResolver(message))
      // services discovery
      const receivers = Object.keys(this.__receivers)
      receivers.map(name => {
        this.bus.listen(name, async (data) => {
          this.debug('receiver %s has been called with data %o', name, data)
          const result = await this.__receivers[name].execute(data)
          this.publish(result.event, result)
          if (data.__headers) {
            this.debug('responser %s need to be called with result %o', name, result)
            this.bus.send(data.__headers['x-client-id'], result)
          }
        })
      })
      this.emit('ready')
    })
  }
  close () {
    this.bus.close()
  }
  publish (name, data) {
    this.debug('publisher %s has been sent with data %o', name, data)
    this.bus.publish(name, data)
  }
  healthcheck () {
    const rss = process.memoryUsage().rss / (1024 * 1024)
    const data = {type: 'Server', uuid: this.uuid, memory: Math.round(rss * 100) / 100, services: Object.keys(this.__receivers)}
    this.bus.publish('__System.Nova.HealthCheck', data)
  }
  healthcheckResolver (data) {
    if (data.uuid === this.uuid) { return false }
    this.debug('healthcheck has been received with data %o', data)
  }
}

util.inherits(Server, EventEmitter)

module.exports = Server
