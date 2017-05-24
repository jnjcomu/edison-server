const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const config = require('../config')
const secret = require('../config/secret')
const Dimigo = require('../util/dimigo')

const api = new Dimigo()

class UserClass {
  static async authenticate ({ username, password }) {
    if (!username) throw new Error('username is undefined')
    if (!password) throw new Error('password is undefined')

    const { data } = await api.identifyUser(username, password)
    const { id, name, user_type: userType, email, gender, nickname } = data

    let user = await this.findOne({ username })
    if (!user) user = new this({ id, username, name, userType, email, gender, nickname })

    await user.save()

    const token = { id, name, userType }
    return jwt.sign(token, secret.JWT_SECRET, { expiresIn: config.TOKEN_LIFETIME })
  }
}

const schema = mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, unique: true },

  name: String,
  userType: String,

  email: String,
  gender: String,
  nickname: String
})

schema.loadClass(UserClass)
module.exports = mongoose.model('User', schema)
