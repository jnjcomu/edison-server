const crc32 = require('crc-32')
const sha256 = require('sha256')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const axios = require('axios')
const config = require('../config')
const secret = require('../config/secret')

const auth = {
  username: secret.DIMIGO_API_ID,
  password: secret.DIMIGO_API_PW
}

const uri = {
  auth: () => `${config.DIMIGO_API_HOST}/users/identify`,
  student: (username) => `${config.DIMIGO_API_HOST}/user-students/${username}`
}

async function fetch (url, params = {}) {
  try {
    // HTTP basic authentication
    return await axios.get(url, { auth, params })
  } catch (err) {
    // set proper error message and rethrow
    throw new Error(err.response && err.response.data || err)
  }
}

const schema = mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, unique: true },

  token: String,
  name: String,
  serial: String
})

schema.statics.hash = (password) => {
  const hash = crc32.str(password) >>> 0 // convert to uint32
  const padded = `0000000000${hash}`.slice(-10) // sprintf("%010s", str)

  return '@' + sha256(password + padded)
}

schema.statics.authenticate = async function ({ username, password }) {
  if (!username) throw new Error('username is undefined')
  if (!password) throw new Error('password is undefined')

  const params = { username, password: this.hash(password) }
  const { data: userData } = await fetch(uri.auth(), params)
  const { id, name, sso_token: token } = userData

  let user = await this.findOne({ username })
  if (!user) {
    const { data: studentData } = await fetch(uri.student(username))
    user = new this({ id, username, token, name, serial: studentData.serial })
  }

  user.token = token
  await user.save()

  return await jwt.sign({ username, serial: user.serial }, secret.JWT_SECRET)
}

module.exports = mongoose.model('User', schema)
