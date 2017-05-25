const Router = require('koa-router')
const router = new Router({ prefix: '/auth' })

const session = require('./session')
const User = require('../models/User')

router.post('/', async (ctx) =>
  (ctx.body = await User.authenticate(ctx.request.body)))

router.post('/renew', session(), async (ctx) =>
  (ctx.body = await ctx.user.createToken()))

module.exports = router
