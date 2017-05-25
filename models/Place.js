const mongoose = require('mongoose')

class PlaceClass {
  static async findById (ctx) {
    const { id } = ctx.params

    const place = await this.findOne({ id })
    if (place) return (ctx.body = place)

    const err = new Error()
    throw (err.statusCode = 404, err)
  }
}

const schema = new mongoose.Schema({
  id: { type: Number, unique: true },

  name: String,
  location: String,
  people: [{ code: Number, name: String }]
})

schema.loadClass(PlaceClass)
module.exports = mongoose.model('Place', schema)
