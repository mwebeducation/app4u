require('dotenv').config()

const { SALT_LENGTH } = process.env

const saltLength = +SALT_LENGTH || 10

module.exports = {
  saltLength,
}
