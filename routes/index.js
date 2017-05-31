const compose = require('koa-compose')

const routes = [
  require('./auth'),
  require('./places')
]

const middleware = routes
  .map(r => [r.routes(), r.allowedMethods()])
  .reduce((a, b) => a.concat(b))

module.exports = () => compose(middleware)
