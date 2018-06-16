const expect = require('chai').expect
const before = require('../../../plugins/healthcheck/before')
const after = require('../../../plugins/healthcheck/after')

describe('[plugins] healthcheck', () => {
  it('should register before hook', async () => {
    try {
      await before.register({
        app: {}
      })
    } catch (e) {
      expect(e).to.equal(null)
    }
  })
  it('should register after hook', async () => {
    try {
      await after.register({
        app: {},
        bus: {
          subscribe: () => {}
        }
      })
    } catch (e) {
      expect(e).to.equal(null)
    }
  })
})
