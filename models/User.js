const config = require('config')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const mongooseHidden = require('mongoose-hidden')

const Dimigo = require('dimigo')
const api = new Dimigo(config.get('dimigo'))

const jwtOptions = [
  config.get('jwt.secret'),
  { expiresIn: config.get('jwt.lifetime') }
]

const adminUserTypes = 'TD' // 교사 or 생활관교사
const tokenFields = 'id username isAdmin tokenNumber'.split(' ')

class UserClass {
  static async authenticate ({ username, password }) {
    if (!username) throw new Error('username is undefined')
    if (!password) throw new Error('password is undefined')

    const data = await api.identifyUser(username, password)
    const { id, name, userType, email, gender, nickname } = data

    let user = await this.findOne({ username })
    if (!user) user = new this({ id, username, name, userType, email, gender, nickname })

    await user.save()
    return user.createToken()
  }

  async createToken (increment = 1) {
    this.tokenNumber = increment + (this.tokenNumber || 0)

    const token = Object.keys(this.toObject())
      .filter(key => tokenFields.includes(key))
      .map(key => ({ [key]: this[key] }))
      .reduce((a, b) => Object.assign(a, b), {})

    await this.save()
    return jwt.sign(token, ...jwtOptions)
  }

  get isAdmin () {
    return this.isHassan || adminUserTypes.includes(this.userType)
  }
}

const schema = mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, unique: true },

  name: String,
  userType: String,
  tokenNumber: { type: Number, default: 0 },
  isHassan: { type: Boolean, default: false },

  email: String,
  gender: String,
  nickname: String
})

schema.loadClass(UserClass)
schema.set('toJSON', { getters: true, virtuals: true })
schema.set('toObject', { getters: true, virtuals: true })

schema.plugin(mongooseHidden())
module.exports = mongoose.model('User', schema)
