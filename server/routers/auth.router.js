const express = require('express')
const autorize = require('../controllers/auth.controller')
const validator = require('../utils/validator')

const router = express.Router()

router.route('/login').post(validator.login, autorize.login)

module.exports = router
