const Boom = require('boom')

module.exports = () => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const { output } = Boom.wrap(err, err.statusCode)

    ctx.body = output.payload
    ctx.status = output.statusCode
    ctx.app.emit('error', err, ctx)
  }
}
