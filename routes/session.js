const config = require('config')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

function error (statusCode, message) {
  const err = new Error(message)
  err.statusCode = statusCode

  return err
}

async function verify (token) {
  try {
    return await jwt.verify(token, config.get('jwt.secret'))
  } catch (err) {
    if (err.name !== 'TokenExpiredError') throw err
    throw error(401, `token expired at ${err.expiredAt.toISOString()}`)
  }
}

module.exports = (adminOnly = false) => async (ctx, next) => {
  const { token } = ctx.request.body
  if (!token) throw error(401, 'a token is reqired')

  const payload = await verify(token)
  if (!payload) throw error(401, 'no payload included')

  const { id, username, isAdmin, tokenNumber: no } = payload
  if (adminOnly && !isAdmin) throw error(401, `access denied`)

  const user = await User.findOne({ id, username })
  if (!user) throw error(404, `the user ${username} doesn't exist`)
  if (user.tokenNumber !== no) throw error(401, 'revoked token given')

  ctx.user = user
  return next()
}
