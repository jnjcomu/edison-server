const axios = require('axios')
const crc32 = require('crc-32')
const sha256 = require('sha256')
const config = require('config')

const defaults = config.get('dimigo')

class Dimigo {
  constructor (options = defaults) {
    const { host: baseURL, username, password } = options
    this.instance = axios.create({ baseURL, auth: { username, password } })
  }

  async fetch (url, options = {}) {
    try {
      return await this.instance.get(url, options)
    } catch (err) {
      if (!err) throw new Error()
      if (!err.response) throw err

      const { status, data } = err.response
      if (status !== 404) throw err

      const error = new Error(data.message || err.message)
      throw (error.statusCode = 401, error)
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

Dimigo.userTypes = {
  T: '교사',
  D: '생활관교사',
  S: '학생', // or 졸업생 (see `user_gcn_history` table)
  P: '학부모',
  O: '손님'
}

Dimigo.genders = { M: '남자', F: '여자', NULL: 'Unknown' }

module.exports = Dimigo
