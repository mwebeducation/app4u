require('dotenv').config()

const { SESSION_SECRET } = process.env

const secret = SESSION_SECRET || 'super secret';


exports.sessionConfigs = {
  secret,
  resalve: false,
  saveUninitialized: true,
  cookie: { secure: true },
}