const createHttpError = require('http-errors')
const passport = require('passport')
const asyncHandler = require('express-async-handler')
const User = require('../models/User.model')
require('../configs/passport.config')

/**
 * @Controller authenticate login with passport-local
 */
const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(createHttpError(500, 'Soemthing went wrong!'))
    else if (user) return res.status(200).json(user).end()

    switch (info.message) {
      case 'Not found':
        return next(createHttpError(404, 'User is not existed!'))
      case 'Invalid password':
        return next(createHttpError(422, 'Invalid email or password!'))
      case 'Missing credentials':
        return next(createHttpError(422, 'Missing credentials!'))
      default:
        return next(createHttpError(500, 'Internal server error!'))
    }
  })(req, res, next)
}

/**
 * @Controller autoirze (for only specific user)
 */
const onlySpecificUser = asyncHandler((req, res, next) => {
  return passport.authorize('jwt', { session: false }, async (err, user, info) => {
    try {
      // ! return 500 errir if error
      if (err) return next(createHttpError(500, 'Something went wrong!'))
      // * if user, check user is same with req user id and role
      else if (user) {
        // ? find specific user
        const specificUser = await User.findById(req.params.id)

        // * go to controller if same
        if (user.id === specificUser.id && user.role === specificUser.role) return next()

        // ! return 403 error if not same
        return next(createHttpError(403, 'You are not authorized!'))
      }

      // ! return error depending on error info messge
      switch (info.message) {
        case 'invalid signature': // invalid token
          return next(createHttpError(403, 'You are not authorized!'))
        case 'No user': // not found user
          return next(createHttpError(404, "User doesn't not exist!"))
        case 'Invalid password':
          return next(createHttpError(401, 'Invalid email or password!'))
        default: // default
          return next(createHttpError(500, 'Soemthing went wrong!'))
      }
    } catch (err) {
      return next(err)
    }
  })(req, res, next)
})

/**
 * @Controller autoirze (for only specific Founder)
 */
const onlySpecificFounder = asyncHandler((req, res, next) => {
  return passport.authorize('jwt', { session: false }, async (err, user, info) => {
    try {
      // ! return 500 errir if error
      if (err) return next(createHttpError(500, 'Something went wrong!'))
      // * if user, check user is same with req user id and role
      else if (user) {
        // * go to controller if same
        if (user.role === 'Founder') return next()

        // ! return 403 error if not same
        return next(createHttpError(403, 'You are not authorized!'))
      }

      // ! return error depending on error info messge
      switch (info.message) {
        case 'invalid signature': // invalid token
          return next(createHttpError(403, 'You are not authorized!'))
        case 'No user': // not found user
          return next(createHttpError(404, "User doesn't not exist!"))
        case 'Invalid password':
          return next(createHttpError(401, 'Invalid email or password!'))
        default: // default
          return next(createHttpError(500, 'Soemthing went wrong!'))
      }
    } catch (err) {
      return next(err)
    }
  })(req, res, next)
})

/**
 * @Controller autoirze (for only founder and admin)
 */
const onlyFounderOrAdmin = asyncHandler((req, res, next) => {
  return passport.authorize('jwt', { session: false }, (err, user, info) => {
    try {
      // ! return 500 errir if error
      if (err !== null) return next(createHttpError(500, 'Internal server error!'))
      // * if user, check user is same with req user id and role
      else if (user) {
        // * go to controller if same
        if (user.role === 'Admin' || user.role === 'Founder') return next()

        // ! return 403 error if not same
        return next(createHttpError(403, 'You are not authorized!!'))
      }

      // ! return error depending on error info messge
      switch (info.message) {
        case 'invalid signature': // invalid token
          return next(createHttpError(403, 'You are not authorized!'))
        case 'No user': // not found user
          return next(createHttpError(404, "User doesn't not exist!"))
        case 'Invalid password':
          return next(createHttpError(401, 'Invalid email or password!'))
        case 'No auth token':
          return next(createHttpError(401))
        default: // default
          return next(createHttpError(500, 'Soemthing went wrong!'))
      }
    } catch (err) {
      return next(err)
    }
  })(req, res, next)
})

/**
 * @Controller autoirze (for only developer)
 */
const onlyDeveloper = asyncHandler((req, res, next) => {
  return passport.authorize('jwt', { session: false }, async (err, user, info) => {
    try {
      // ! return 500 errir if error
      if (err) return next(createHttpError(500, 'Something went wrong!'))
      // * if user, check user is same with req user id and role
      else if (user) {
        // * go to controller if developer
        if (user.role === 'Developer') return next()

        // ! return 403 error if not same
        return next(createHttpError(403, 'You are not authorized!'))
      }

      // ! return error depending on error info messge
      switch (info.message) {
        case 'invalid signature': // invalid token
          return next(createHttpError(403, 'You are not authorized!'))
        case 'No user': // not found user
          return next(createHttpError(404, "User doesn't not exist!"))
        case 'Invalid password':
          return next(createHttpError(401, 'Invalid email or password!'))
        default: // default
          return next(createHttpError(500, 'Soemthing went wrong!'))
      }
    } catch (err) {
      return next(err)
    }
  })(req, res, next)
})

module.exports = {
  login,
  onlySpecificUser,
  onlySpecificFounder,
  onlyFounderOrAdmin,
  onlyDeveloper,
}
