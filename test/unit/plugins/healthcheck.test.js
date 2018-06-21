const expect = require('chai').expect
const before = require('../../../plugins/healthcheck/before')
const after = require('../../../plugins/healthcheck/after')

describe('[unit] the plugin healthcheck', () => {
  it('should register before hook', async () => {
    try {
      let context = {
        app: {},
        bus: {
          publish (label, data) {
            expect(label).to.equal('__System.Nova.HealthCheck')
          }
        }
      }
      await before.register(context)
    } catch (e) {
      expect(e).to.equal(null)
    }
  })
  it('should register before hook with receivers', async () => {
    try {
      let context = {
        app: {
          __receivers: {
          }
        },
        bus: {
          publish (label, data) {
            expect(label).to.equal('__System.Nova.HealthCheck')
            console.log('2', data)
          }
        }
      }
      await before.register(context, {interval: 2000})
      context.app.healthcheckResolver({})
    } catch (e) {
      expect(e).to.equal(null)
    }
  })
  it('should register after hook', async () => {
    try {
      let context = {
        app: {},
        bus: {
          subscribe: () => {}
        }
      }
      await after.register(context)
    } catch (e) {
      expect(e).to.equal(null)
    }
  })
})
