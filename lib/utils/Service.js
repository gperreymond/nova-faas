const uuid = require('uuid')

const NovaError = require('./NovaError')

class Service {
  constructor () {
    this.uuid = uuid.v4()
  }
  async execute (params = {}) {
    const novaError = new NovaError()
    const starttime = Date.now()
    try {
      if (!this.handler) throw novaError.log('service_handler_undefined')
      if (!this.type) throw novaError.log('service_type_undefined')
      if (!this.name) throw novaError.log('service_name_undefined')
      const result = await this.handler(params)
      const exectime = Date.now() - starttime
      let p = {
        type: this.type,
        name: this.name,
        event: this.EventSuccess,
        params,
        exectime
      }
      if (this.type === 'Query') { p.result = result }
      return p
    } catch (error) {
      let p = {
        type: this.type,
        name: this.name,
        event: this.EventError,
        params
      }
      if (!error.eraro) {
        p.result = novaError.log('service_error', {type: this.type + '.Error', name: this.name, error})
      } else {
        p.result = error
      }
      return p
    }
  }
}

module.exports = Service
