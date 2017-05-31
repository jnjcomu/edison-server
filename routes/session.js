const jwt = require('koa-jwt')
const compose = require('koa-compose')

const config = require('config')
const User = require('../models/User')

async function isRevoked (ctx, user, token) {
  const { id, username, tokenNumber } = user
  const document = await User.findOne({ id, username })
  return !document || tokenNumber !== document.tokenNumber
}

module.exports = (adminOnly = false) => compose([
  jwt({
    isRevoked,
    debug: true,
    secret: config.get('jwt.secret')
  }),

  async (ctx, next) => {
    const { id, username, isAdmin } = ctx.state.user
    if (adminOnly && !isAdmin) return ctx.throw(401, 'Access denied')

    ctx.user = await User.findOne({ id, username })
    return next()
  }
])
