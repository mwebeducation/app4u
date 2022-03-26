const Redis = require('ioredis')
const consola = require('consola')
const redis = new Redis({ enableAutoPipelining: true, enableOfflineQueue: false })

redis.on('ready', () => consola.success('Successfully connected to Redis Server'))

redis.on('error', err => consola.error(`Error connection to Redis Server, ${err.message}`))

redis.on('close', () => consola.info('Redis Server closed!'))

module.exports = redis
