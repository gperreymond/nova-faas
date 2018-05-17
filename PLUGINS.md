 # plugins

 * Plugins provide a way to upgrade __servers__ and/or __clients__
 * You can now create your own plugins, or use existing ones

## Create your first plugin

A plugin is an object, the property __name__ and the property __register__ is a promise. those two properties are mandatory.

```javascript
const register = (context, options) => {
  return new Promise((resolve, reject) => {
    try {
      // context is an instance of Client of Server
      // put logic here
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  name: 'my-first-plugin',
  register
}
```

You will have access to __context__ and then attach thing to it, but be aware of errors you could make. I will give you here some good pratices, after all it's javascritpt and you could do anything you want on those objects.

* server.app: is an object, you can attach your own methods, options or properties here
* server.bus: is an instance of __servicebus__, so you can add your own events

## how to register a plugin

```javascript
const Server = require('nova-faas').Server
const server = new Server()

const MyFirstPlugin = require('./plugins/my-first-plugin')

server
  .register(MyFirstPlugin)
  .use(path.resolve(__dirname, '../test/data/commands/*.js'))
  .use(path.resolve(__dirname, '../test/data/queries/*.js'))
  .start()

```
