const createHttpError = require('http-errors')
const { RateLimiterRedis } = require('rate-limiter-flexible')
const redisClient = require('../configs/redis.config')

const opts = {
  // Basic options
  storeClient: redisClient,
  points: 50, // Number of points
  duration: 59, // Per second(s)

  // Custom
  execEvenly: false, // Do not delay actions evenly
  blockDuration: 0, // Do not block if consumed more than points
  keyPrefix: 'rlflx', // must be unique for limiters with different purpose
}

const rateLimiter = new RateLimiterRedis(opts)

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next()
    })
    .catch(rateLimiterRes => {
      const headers = {
        'Retry-After': rateLimiterRes.msBeforeNext / 1000,
        'X-RateLimit-Limit': opts.points,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      }
      res.set(headers)
      return next(createHttpError(429))
    })
}

module.exports = rateLimiterMiddleware
