const User = require('../models/User.model')
const createHttpError = require('http-errors')
const expressAsyncHandler = require('express-async-handler')
const joiValidator = require('../utils/joi.validator')

const login = expressAsyncHandler(async (req, res, next) => {
  try {
    // ? validate req body with joi validator
    const result = await joiValidator.login.validateAsync(req.body)

    //  ? find user
    const user = await User.findOne({ email: result.email })

    // ! return 404 error if no user with that email
    if (!user) return next(createHttpError(404))

    // ? validate password is match
    const isMatchPassword = user.isMatchPassword(result.password)

    // ! return 402 error if not match pwd
    if (!isMatchPassword) return next(createHttpError(401))

    // ? generate jwt token
    const jwtToken = await user.generateJwtToken()

    if (!jwtToken) return next(createHttpError(500))

    return res.status(200).json({
      data: {
        meta: {
          message: `Welcome Back ${user.displayName}`,
          token: `Bearer ${jwtToken}`,
        },
        link: {
          self: 'https://localhost:8000/api/auth/login',
          user: `https://localhost:8000/api/users/${user.id}`,
        },
      },
    })
  } catch (err) {
    return next(err)
  }
})

module.exports = {
  login,
}
