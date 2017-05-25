const Router = require('koa-router')
const router = new Router({ prefix: '/places' })

const Place = require('../models/Place')

router.post('/', async (ctx) =>
  (ctx.body = await Place.find()))

module.exports = router
