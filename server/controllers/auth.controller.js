const createHttpError = require('http-errors')
const passport = require('passport')

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
const autorizeOnlySpecificUser = (req, res, next) => {
  return passport.authorize('jwt', { session: false }, (err, user, info) => {
    if (err) return next(createHttpError(500, 'Something went wrong!'))
    else if (user) return next()

    switch (info.message) {
      case 'invalid signature':
        return next(createHttpError(403, 'You are not authorized!'))
      case 'No user':
        return next(createHttpError(404, "User doesn't not exist!"))
      default:
        return next(createHttpError(500, 'Soemthing went wrong!'))
    }
  })(req, res, next)
}
module.exports = {
  login,
  autorizeOnlySpecificUser,
}
