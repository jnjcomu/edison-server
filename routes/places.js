const Router = require('koa-router')
const router = new Router({ prefix: '/places' })

const session = require('./session')
const Place = require('../models/Place')

router.use(session())

router.get('/', async ctx =>
  (ctx.body = await Place.findAll(ctx)))

router.get('/:id', async ctx =>
  (ctx.body = await Place.findByContext(ctx)))

router.post('/:id/enter', async ctx =>
  (ctx.body = await ctx.user.enter(ctx)))

router.post('/leave', async ctx =>
  (ctx.body = await ctx.user.leave()))

module.exports = router
