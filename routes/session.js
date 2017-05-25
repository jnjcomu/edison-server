const jwt = require('jsonwebtoken')
const secret = require('../config/secret')

const User = require('../models/User')

const error = (statusCode, message, err) =>
  (err = new Error(message)) && (err.statusCode = statusCode) && err

module.exports = (adminOnly = false) => async (ctx, next) => {
  const { token } = ctx.request.body
  if (!token) throw error(401, 'a token is reqired')

  const payload = await jwt.verify(token, secret.JWT_SECRET)
  const { id, username, isAdmin, tokenNumber: no } = payload
  if (adminOnly && !isAdmin) throw error(401, `access denied`)

  const user = await User.findOne({ id, username })
  if (!user) throw error(404, `the user ${username} doesn't exist`)
  if (user.tokenNumber !== no) throw error(401, 'revoked token given')

  ctx.user = user
  return next()
}
