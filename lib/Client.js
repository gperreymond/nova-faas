const uuid = require('uuid')
const Hoek = require('hoek')
const EventEmitter = require('events').EventEmitter
const util = require('util')
let servicebus = require('servicebus') // for rewire in tests

const NovaError = require('./utils/NovaError')
const novaError = new NovaError()

// plugins
const HealthCheckPluginBefore = require('../plugins/healthcheck/before')
const HealthCheckPluginAfter = require('../plugins/healthcheck/after')

class Client {
  constructor (bus) {
    this.debug = require('debug')('nova:client')
    this.type = 'Client'
    this.uuid = uuid.v4()
    this.starttime = Date.now()
    this.__headers = {
      'x-client-id': 'Client.Response.' + this.uuid
    }
    this.app = {}
    this.__plugins = []
    this.__requesters = {}
    this.__subscribers = {}
    EventEmitter.call(this)
  }
  // subscribe to events error and/or success
  subscribe (name, handler) {
    this.debug('subscriber %s has been added', name)
    this.__subscribers[name] = handler
    return this
  }
  // fire & forget
  send (name, data) {
    this.debug('sender %s has been called with data %o', name, data)
    this.bus.send(name, data)
  }
  // request & response
  request (name, data, callback) {
    this.debug('requester %s has been called with data %o', name, data)
    data.__headers = Hoek.clone(Object.assign(this.__headers, {'x-request-id': uuid.v4()}))
    this.__requesters[data.__headers['x-request-id']] = callback
    this.bus.send(name, data)
  }
  register (plugin, options = {}) {
    try {
      if (this.__plugins[plugin.name]) { throw new Error('Plugin already exists') } else { this.__plugins[plugin.name] = true }
      plugin.register(this, options).catch(err => { throw err })
      return this
    } catch (e) {
      this.emit('error', novaError.log('internal_error', {uuid: this.uuid, type: 'Client', name: 'Client', error: e}))
    }
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
    this.register(HealthCheckPluginBefore)
    this.bus.on('error', error => {
      this.emit('error', novaError.log('internal_error', {uuid: this.uuid, type: 'Client', name: 'Client', error}))
    })
    this.bus.on('ready', () => {
      this.register(HealthCheckPluginAfter)
      // the response channel
      this.bus.listen(this.__headers['x-client-id'], data => {
        this.debug('responser has been called with data %o', data)
        const callback = Hoek.clone(this.__requesters[data.params.__headers['x-request-id']])
        delete this.__requesters[data.params.__headers['x-request-id']]
        delete data.params.__headers
        callback(data)
      })
      // all events subscribers
      const subscribers = Object.keys(this.__subscribers)
      subscribers.map(name => {
        this.bus.subscribe({
          routingKey: name,
          queueName: name + '.' + this.uuid
        }, async (data) => {
          this.debug('subscriber %s has been called with data %o', name, data)
          await this.__subscribers[name](data)
        })
      })
      this.emit('ready')
    })
  }
  close () {
    this.bus.close()
  }
}

util.inherits(Client, EventEmitter)

module.exports = Client
