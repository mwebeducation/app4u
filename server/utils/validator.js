const joiValidator = require('./joiSchema')
const mongoose = require('mongoose')
const createHttpError = require('http-errors')

const login = async (req, _res, next) => {
  try {
    await joiValidator.login.validateAsync(req.body)

    // * if validate; retur next()
    return next()
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
}

const idValidator = (req, _res, next) => {
  const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id)

  // ! return 400 error if not valid
  if (!isMongoId) return next(createHttpError(400))

  // * if validate; retur next()
  return next()
}

const register = async (req, _res, next) => {
  try {
    // ? validate req body
    await joiValidator.register.validateAsync(req.body)

    // * if validate; retur next()
    return next()
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
}

const verifyToken = async (req, _res, next) => {
  try {
    // ? validate req query
    await joiValidator.vierifyToken.validateAsync(req.query)

    // * if validate; retur next()
    return next()
  } catch (err) {
    if (err.isJoi) err.staus = 422
    return next(err)
  }
}

const newPassword = async (req, _res, next) => {
  try {
    // ? validate req body
    await joiValidator.passwordValidtor.validateAsync(req.body)

    // * if validate; retur next()
    return next()
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
}

const newEmail = async (req, _res, next) => {
  try {
    // ? validate req body
    await joiValidator.newEmailValidator.validateAsync(req.body)

    // * if validate; retur next()
    return next()
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
}

const confirmPassword = async (req, _res, next) => {
  try {
    // ? validate req body
    await joiValidator.confirmPassword.validateAsync(req.body)

    // * if validate; retur next()
    return next()
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
}
module.exports = {
  login,
  idValidator,
  register,
  verifyToken,
  newPassword,
  newEmail,
  confirmPassword,
}
