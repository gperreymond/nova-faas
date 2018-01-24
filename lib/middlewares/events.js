module.exports = function () {
  function handleIncoming (channel, message, options, next) {
    console.log('handleIncoming', channel, message)
    if (typeof options === 'function') {
      next = options
      options = null
    }
    next.bind(this, null, channel, message, options)()
  }
  function handleOutgoing (queueName, message, options, next) {
    console.log('handleOutgoing', queueName, message)
    if (typeof options === 'function') {
      next = options
      options = null
    }
    next(null, queueName, message, options)
  }

  return {
    handleIncoming,
    handleOutgoing
  }
}
