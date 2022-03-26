require('dotenv').config()

const { SALT_LENGTH, ALGO1, ALGO2, ALGO3, ALGO4, ALGO5, DIGEST1, DIGEST2, RANDOMNO } = process.env

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
}
