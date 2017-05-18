const axios = require('axios')
const crc32 = require('crc-32')
const sha256 = require('sha256')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const config = require('../config')
const secret = require('../config/secret')

const uri = {
  auth: () => `${config.DIMIGO_API_HOST}/users/identify`,
  student: (username) => `${config.DIMIGO_API_HOST}/user-students/${username}`
}

class UserClass {
  static hash (password) {
    const hash = crc32.str(password) >>> 0 // convert to uint32
    const padded = `0000000000${hash}`.slice(-10) // sprintf("%010s", str)

    return '@' + sha256(password + padded)
  }

  async fetch (url, params = {}) {
    try {
      // HTTP basic authentication
      return await axios.get(url, {
        params,
        auth: { username: secret.DIMIGO_API_ID, password: secret.DIMIGO_API_PW }
      })
    } catch (err) {
      // set proper error message and rethrow
      throw new Error(err.response ? err.response.data : err)
    }
  }

  async authenticate ({ username, password }) {
    if (!username) throw new Error('username is undefined')
    if (!password) throw new Error('password is undefined')

    const params = { username, password: this.hash(password) }
    const { data: { id, name, sso_token: token, user_type: userType } } = await this.fetch(uri.auth(), params)

    let user = await this.findOne({ username })
    if (!user) {
      const { data: { serial } } = await this.fetch(uri.student(username))
      user = new this({ id, username, token, name, serial, userType })
    }

    user.token = token
    await user.save()

    const content = { id, userType }
    return jwt.sign(content, secret.JWT_SECRET, { expiresIn: '2h' })
  }
}

const schema = mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, unique: true },

  name: String,
  serial: String,
  userType: String,

  token: String
})

schema.loadClass(UserClass)
module.exports = mongoose.model('User', schema)
