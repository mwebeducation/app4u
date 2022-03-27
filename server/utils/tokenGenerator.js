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

const generator = () => {
  let randomString = ''
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = characters.length
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * length))
  }

  const randomNumbers = randomBytes(randomNo).toString('utf-8')

  const hashString1 = createHmac(algo1, randomString).update(randomNumbers).digest(digest1)

  const hashString2 = createHmac(algo2, randomNumbers).update(randomString).digest(digest2)

  const hashString3 = createHmac(algo3, hashString1).update(hashString2).digest(digest1)

  const hashString4 = createHmac(algo4, hashString2).update(hashString1).digest(digest1)

  const hashString5 = hashString4 + hashString1 + hashString3 + hashString1

  const hashString6 = createHash(algo5).update(hashString5).digest(digest2)

  const hashString7 = createHmac(algo1, hashString6).update(hashString6).digest(digest1)

  const finalResult = createHash(algo5).update(hashString7).digest(digest1)

  return finalResult
}

const tokenGenerator = () => {
  const token1 = generator()
  const token2 = generator()

  let hashedString = ''

  const length = token1.length + token2.length

  const characters = token1 + token2

  for (let i = 0; i < length; i++) {
    hashedString += characters.charAt(Math.floor(Math.random() * length))
  }

  consola.info('Token ==> ', hashedString)
  return hashedString
}

module.exports = tokenGenerator
