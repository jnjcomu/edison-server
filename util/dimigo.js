const axios = require('axios')
const crc32 = require('crc-32')
const sha256 = require('sha256')

const secret = require('../config/secret')
const defaults = {
  host: secret.DIMIGO_API_HOST,
  username: secret.DIMIGO_API_USERNAME,
  password: secret.DIMIGO_API_PASSWORD
}

module.exports = class Dimigo {
  constructor (options = defaults) {
    const { host: baseURL, username, password } = options
    this.instance = axios.create({ baseURL, auth: { username, password } })
  }

  async fetch (url, options = {}) {
    try {
      return await this.instance.get(url, options)
    } catch (err) {
      if (!err.response) throw err
      const { status, data } = err.response

      if (status !== 404) throw err
      const error = new Error(data.message || err.message)

      error.statusCode = 401
      throw error
    }
  }

  static createHash (password) {
    const hash = crc32.str(password) >>> 0 // convert to uint32
    const padded = `0000000000${hash}`.slice(-10) // sprintf("%010s", str)

    return '@' + sha256(password + padded)
  }

  async identifyUser (username, password, hash = Dimigo.createHash) {
    const params = { username, password: hash(password) }
    return this.fetch('/users/identify', { params })
  }

  async getStudent (username) {
    return this.fetch(`/user-students/${username}`)
  }

  async getTeacher (username) {
    return this.fetch(`/user-teachers/${username}`)
  }
}
