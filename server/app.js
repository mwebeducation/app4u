const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const logger = require('morgan')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const csurf = require('csurf')
const mongoSanitize = require('express-mongo-sanitize')
const compression = require('compression')
const toobusy = require('toobusy-js')
const createErr = require('http-errors')
const rateLimiter = require('./utils/rateLimiter')
const applicantRouter = require('./routers/applicant.router')
const userRouter = require('./routers/user.router')
const authRouter = require('./routers/auth.router')
const passport = require('passport')

const app = express()

/**
 * @Configuration
 */

const corsOpt = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}

const json = express.json
const urlEncoded = express.urlencoded

/**
 * @Middlewares
 */
app.enable('trust proxy') // trust first proxy
app.use(cors(corsOpt))
app.use(rateLimiter)
app.use(logger('dev'))
app.use(json())
app.use(urlEncoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())
app.use(compression())
app.use(hpp())
app.use(mongoSanitize())
app.use(
  csurf({
    cookie: {
      expires: 86400000,
      maxAge: 86400000,
      secure: true,
    },
  })
)
app.use(passport.initialize())

/**
 * @Router api router
 */

app.get('/csrf_token', (req, res) => {
  // * csrf token route
  return res.status(200).json({
    data: {
      token: req.csrfToken(),
    },
  })
})

app.use('/api/auth', authRouter) // * auth (login, logout) route

app.use('/api/applicants', applicantRouter) // * applicants route

app.use('/api/users', userRouter) // * users route

/**
 * @Error section
 */
app.use((_req, _res, next) => {
  if (!toobusy()) return next()
  return next(createErr(503))
})

app.use((req, res, next) => next(createErr(404)))

app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Internal Server Error!'
  res
    .status(status)
    .json({
      errors: {
        status,
        message,
      },
    })
    .end()
  return next()
})

module.exports = app
