const mongoose = require('mongoose')

class PlaceClass {
  static async findById (ctx) {
    const { id } = ctx.params
    const place = this.findOne({ id })

    if (place) ctx.body = place
    else ctx.status = 404
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
