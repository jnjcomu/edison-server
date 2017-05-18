const Router = require('koa-router')
const router = new Router({ prefix: '/places' })

const Place = require('../models/Place')

router.post('/', async (ctx) => {
  try {
    ctx.body = await Place.find({})
  } catch (err) {
    console.error(err)
    ctx.throw(401, err.message)
  }
})

module.exports = router
