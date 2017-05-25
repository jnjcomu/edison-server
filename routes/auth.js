const Router = require('koa-router')
const router = new Router({ prefix: '/auth' })

const User = require('../models/User')

router.post('/', async (ctx) =>
  (ctx.body = await User.authenticate(ctx.request.body)))

module.exports = router
