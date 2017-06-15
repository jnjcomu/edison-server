const config = require('config')
const jwt = require('jsonwebtoken')

const Place = require('./Place')
const mongoose = require('mongoose')
const mongooseHidden = require('mongoose-hidden')

const Dimigo = require('dimigo')
const api = new Dimigo(config.get('dimigo'))

const jwtOptions = [
  config.get('jwt.secret'),
  { expiresIn: config.get('jwt.lifetime') }
]

const adminUserTypes = 'TD' // 교사 or 생활관교사
const studentFields = 'grade clazz number serial'.split(' ')

const filterObject = (obj, list) => Object.keys(obj)
  .filter(key => list.includes(key))
  .map(key => ({ [key]: obj[key] }))
  .reduce((a, b) => Object.assign(a, b), {})

class UserClass {
  static async authenticate ({ username, password }) {
    if (!username) throw new Error('username is undefined')
    if (!password) throw new Error('password is undefined')

    const data = await api.identifyUser(username, password)
    const { id, name, userType, email, gender, nickname } = data

    let user = await this.findOne({ username })
    if (!user) user = new this({ id, username, name, userType, email, gender, nickname })

    user.information = await user.getInformation()
    return { token: await user.createToken() }
  }

  get isAdmin () {
    return this.isHassan || adminUserTypes.includes(this.userType)
  }

  async getInformation () {
    switch (this.userType) {
      case 'S':
        const student = await api.getStudent(this.username)
        return filterObject(student, studentFields)

      default: return {}
    }
  }

  async createToken (increment = 1) {
    this.tokenNumber = increment + (this.tokenNumber || 0)
    await this.save()

    return jwt.sign(this.toObject(), ...jwtOptions)
  }

  async enter (ctx) {
    await this.leave()

    const place = await Place.findByContext(ctx)
    place.addUser(this)

    this.place = place._id
    return this.save()
  }

  async leave () {
    if (!this.place) return

    const place = await Place.findById(this.place)
    place.removeUser(this)

    this.place = null
    return this.save()
  }
}

const schema = mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, unique: true },

  name: String,
  email: String,
  gender: String,
  nickname: String,

  userType: String,
  information: Object,
  isHassan: { type: Boolean, default: false },

  tokenNumber: { type: Number, default: 0 },
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' }
})

schema.loadClass(UserClass)
schema.set('toJSON', { getters: true, virtuals: true })
schema.set('toObject', { getters: true, virtuals: true })

schema.plugin(mongooseHidden())
module.exports = mongoose.model('User', schema)
