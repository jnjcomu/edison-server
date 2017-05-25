const Boom = require('boom')
const jwt = require('jsonwebtoken')
const secret = require('../config/secret')

module.exports = (adminOnly = false) => ({
  async session (ctx, next) {
    try {
      const { token } = ctx.request.body
      if (!token) return (ctx.status = 401)

      const payload = await jwt.verify(token, secret.JWT_SECRET)
      if (adminOnly && payload.userType !== 'T') return (ctx.status = 401)
    } catch (err) {
      const { statusCode, payload } = Boom.internal(err)

      ctx.body = payload
      ctx.status = statusCode
    }
  }
})
