### Version 1.1.0

#### Native promises
Remove bluebird library

#### Add healthcheck
Server and Client now publish an event on rabbitmq each second. This event contains the __type__, the __uuid__, the __memory usage__, and if it's a server, the list of __services__ he provides.

```js
nova:server healthcheck has been received with data {
  type: 'Server',
  uuid: 'd0417f38-9dfe-4289-8063-51c99dbccb0e',
  memory: 41.13,
  services: [ 'BasicNopeCommand', 'BasicNopeQuery' ]
}
```
