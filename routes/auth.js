const Boom = require('boom')
const Router = require('koa-router')

const User = require('../models/User')
const router = new Router({ prefix: '/auth' })

router.post('/', async (ctx) => {
  try {
    ctx.body = await User.authenticate(ctx.request.body)
  } catch (err) {
    const { statusCode, payload } = Boom.unauthorized(err).output

    ctx.body = payload
    ctx.status = statusCode
  }
})

module.exports = router
