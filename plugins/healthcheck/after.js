const register = (context, options) => {
  return new Promise((resolve, reject) => {
    try {
      context.bus.subscribe('__System.Nova.HealthCheck', message => context.app.healthcheckResolver(message))
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  name: 'nova-fass-healthcheck-after',
  register
}
