const compose = require('koa-compose')
const routes = 'auth places'.split(' ')

const middleware = routes
  .map(name => require(`./${name}.js`))
  .map(r => [r.routes(), r.allowedMethods()])
  .reduce((a, b) => a.concat(b))

module.exports = () => compose(middleware)
