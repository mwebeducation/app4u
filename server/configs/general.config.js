require('dotenv').config()
const sgMail = require('@sendgrid/mail')

const { SALT_LENGTH, ALGO1, ALGO2, ALGO3, ALGO4, ALGO5, DIGEST1, DIGEST2, RANDOMNO, FOUNDER } =
  process.env

sgMail.setApiKey(process.env.SENDGRID_API_KEY) // Send grid api key global

module.exports = {
  saltLength: +SALT_LENGTH || 10,
  algo1: ALGO1 || 'sha256',
  algo2: ALGO2 || 'sha256',
  algo3: ALGO3 || 'sha256',
  algo4: ALGO4 || 'sha256',
  algo5: ALGO5 || 'sha256',
  digest1: DIGEST1 || 'hex',
  digest2: DIGEST2 || 'hex',
  randomNo: +RANDOMNO || 10,
  founder: FOUNDER || 'yourmail@gmail.com',
}
