require('dotenv').config()
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const redisClient = require('./redis.config')
const { SESSION_SECRET } = process.env

const secret = SESSION_SECRET || 'super secret'

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
})

module.exports = sessionMiddleware
