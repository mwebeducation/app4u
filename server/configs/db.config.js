require('dotenv').config()
const consola = require('consola')

const mongoose = require('mongoose')

const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/app4u'

mongoose
  .connect(dbUri)
  .then(() => consola.success('Successfully connected to MongoDB '))
  .catch(err => consola.error(`Error on connection to MongoDB! \n ${err.message}`))
  .finally(() => consola.info('🚀 ... Everything is OK ... 🚀'))
