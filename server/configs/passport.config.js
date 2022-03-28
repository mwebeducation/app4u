const passport = require('passport')
const LocalStrategy = require('passport-local')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const fs = require('fs')
const path = require('path')
const User = require('../models/User.model')
const config = require('../configs/general.config')

const cwd = process.cwd() // * current working directory

/**
 * @Config passport login user logic @Authentication
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      session: false,
    },
    async (username, password, done) => {
      try {
        // ? find user by email
        const user = await User.findOne({ email: username })

        // ! return 404 error if not found
        if (!user)
          return done(null, false, {
            message: 'Not found',
          })

        // ? validate user password
        const isMatchPassword = await user.isMatchPassword(password)

        // ! return 401 error if not match pwd
        if (!isMatchPassword) return done(null, false, { message: 'Invalid password' })

        // ? generate token
        const token = await user.generateJwtToken()

        // ! return 500 error if can't get token
        if (!token) return done(null, false, { message: 'No token' })

        const data = {
          meta: {
            message: `Welcome back ${user.displayName}`,
            token: `Bearer ${token}`,
          },
        }
        return done(null, data)
      } catch (err) {
        return done(err)
      }
    }
  )
)

/**
 * @Config passport verify user logic @Autorization
 */
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: fs.readFileSync(path.join(cwd, 'cert', 'jwt', 'jwt.pem')),
      algorithms: [config.jwtAlgorithm],
    },
    async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id)
        // ! if not found user, return error
        if (!user) return done(null, false, { message: 'No user' }) // 404 error

        // ? validate user password
        const password = jwt_payload.password || ''

        const isMatchPassword = password === user.password

        // ! return 401 error if not match pwd
        if (!isMatchPassword) return done(null, false, { message: 'Invalid password' })

        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }
  )
)
