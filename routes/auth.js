const Router = require('koa-router')
const router = new Router({ prefix: '/auth' })

const User = require('../models/User')

router.post('/', async (ctx) => {
  try {
    ctx.body = await User.authenticate(ctx.request.body)
  } catch (err) {
    console.error(err)
    ctx.throw(401, err.message)
  }
})

module.exports = router
