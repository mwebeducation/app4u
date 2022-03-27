/**
 * @description
 * token generator function will generate a hex token
 * ! token for verification in applicant user (verificationToken)
 */

const {
  algo1,
  randomNo,
  algo2,
  algo3,
  algo4,
  algo5,
  digest1,
  digest2,
} = require('../configs/general.config')
const { randomBytes, createHmac, createHash } = require('crypto')
const consola = require('consola')

const tokenGenerator = () => {
  let randomString = ''
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = characters.length
  var charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  const randomNumbers = randomBytes(randomNo).toString('hex')

  const hashString1 = createHmac(algo1, randomString).update(randomNumbers).digest(digest1)

  const hashString2 = createHmac(algo2, randomNumbers).update(randomString).digest(digest2)

  const hashString3 = createHmac(algo3, hashString1).update(hashString2).digest(digest1)

  const hashString4 = createHmac(algo4, hashString2).update(hashString1).digest(digest1)

  const hashString5 = hashString4 + hashString1 + hashString3 + hashString1

  const hashString6 = createHash(algo5).update(hashString5).digest(digest2)

  const hashString7 = createHmac(algo1, hashString6).update(hashString6).digest(digest1)

  const finalResult = createHash(algo5).update(hashString7).digest(digest1)

  consola.info('Token ==> ', finalResult)
  return finalResult
}

module.exports = tokenGenerator
