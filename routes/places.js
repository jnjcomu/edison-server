const Boom = require('boom')
const Router = require('koa-router')

const Place = require('../models/Place')
const router = new Router({ prefix: '/places' })

router.post('/', async (ctx) => {
  try {
    ctx.body = await Place.find({})
  } catch (err) {
    const { statusCode, payload } = Boom.unauthorized(err).output

    ctx.body = payload
    ctx.status = statusCode
  }
})

module.exports = router
