const Boom = require('boom')

module.exports = () => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const { output } = Boom.internal(err)

    ctx.body = output.payload
    ctx.status = output.statusCode
  }
}
