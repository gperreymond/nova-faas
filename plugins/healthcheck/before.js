const register = (context, options) => {
  return new Promise((resolve, reject) => {
    try {
      context.app.healthcheck = () => {
        const rss = process.memoryUsage().rss / (1024 * 1024)
        const data = {type: context.type, uuid: context.uuid, memory: Math.round(rss * 100) / 100}
        if (context.__receivers) { data.services = Object.keys(context.__receivers) }
        context.bus.publish('__System.Nova.HealthCheck', data)
      }
      context.app.healthcheckResolver = data => {
        if (data.uuid === context.uuid) { return false }
        context.debug('healthcheck has been received with data %o', data)
      }
      setInterval(() => { context.app.healthcheck() }, options.interval || 1000)
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  name: 'nova-fass-healthcheck-before',
  register
}
