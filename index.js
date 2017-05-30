const Koa = require('koa')
const config = require('config')
const mongoose = require('mongoose')

const etag = require('koa-etag')
const bodyParser = require('koa-bodyparser')
const conditional = require('koa-conditional-get')

const boom = require('./util/boom')
const routes = require('./routes')
const logger = require('./logger')

function connect () {
  mongoose.Promise = global.Promise
  return mongoose.connect(config.get('mongodb.uri'))
}

function startApp () {
  const app = new Koa()
  const port = process.env.PORT || config.get('port')

  app
    .use(logger())
    .use(conditional())
    .use(etag())
    .use(bodyParser())
    .use(boom())
    .use(routes())

  app.listen(port, () => console.log(`Listening on port ${port}`))
}

connect()
  .then(startApp)
  .catch(err => console.error(err))
