const mongoose = require('mongoose')
const mongooseHidden = require('mongoose-hidden')

class PlaceClass {
  static populated (ctx, cursor) {
    return ctx.user.isAdmin
      ? cursor.populate('users').exec()
      : cursor.select('-users').exec()
  }

  static async findAll (ctx) {
    return this.populated(ctx, this.find())
  }

  static async findByContext (ctx) {
    const { id } = ctx.params
    const place = await this.populated(ctx, this.findOne({ id }))

    if (!place) {
      const err = new Error()
      throw (err.statusCode = 404, err)
    }

    return place
  }

  findUserIndex (user) {
    return this.users.findIndex(id => id.equals(user._id))
  }

  async addUser (user) {
    const index = this.findUserIndex(user)
    if (index >= 0) return

    this.users.push(user._id)
    return this.save()
  }

  async removeUser (user) {
    const index = this.findUserIndex(user)
    if (index < 0) return

    this.users.splice(index, 1)
    return this.save()
  }
}

const schema = new mongoose.Schema({
  id: { type: Number, unique: true },

  name: String,
  location: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})

schema.loadClass(PlaceClass)
schema.set('toJSON', { getters: true, virtuals: true })
schema.set('toObject', { getters: true, virtuals: true })

schema.plugin(mongooseHidden())
module.exports = mongoose.model('Place', schema)
