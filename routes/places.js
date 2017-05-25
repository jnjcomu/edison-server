const Router = require('koa-router')
const router = new Router({ prefix: '/places' })

const session = require('./session')
const Place = require('../models/Place')

router.use(session(true))

router.get('/', async (ctx) =>
  (ctx.body = await Place.find()))

router.get('/:id', async (ctx) =>
  (ctx.body = Place.findById(ctx)))

module.exports = router
