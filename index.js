const Koa = require('koa')

const etag = require('koa-etag')
const conditional = require('koa-conditional-get')
const bodyParser = require('koa-bodyparser')

const routes = require('./routes')
const logger = require('./logger')
const config = require('./config')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

function startApp () {
  const app = new Koa()
  const port = process.env.PORT || config.PORT

  app
    .use(logger())
    .use(conditional())
    .use(etag())
    .use(bodyParser())
    .use(routes())

  app.listen(port, () => console.log(`Listening on port ${port}`))
}

mongoose
  .connect(config.MONGODB_URI)
  .then(startApp).catch(console.error.bind(console))
