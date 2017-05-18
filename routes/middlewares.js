const jwt = require('jsonwebtoken')
const secret = require('../')

module.exports = {
  async isAuthenticated (ctx, next) {
    const { token } = ctx.request.body
    if (!token) return false

    const { userType } = await jwt.verify(token, secret.JWT_SECRET)
    return userType === 'T' || userType === 'D' // 권한 있는 학생은? 하하 몰라!
  }
}
