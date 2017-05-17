const compose = require('koa-compose')
const routes = 'auth'.split(' ')

module.exports = () => compose(routes
  .map(name => require(`./${name}`))
  .reduce((list, r) => list.concat(r.routes(), r.allowedMethods()), []))
