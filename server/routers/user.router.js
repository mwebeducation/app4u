const express = require('express')
const service = require('../controllers/user.controller')
const autorize = require('../controllers/auth.controller')
const validator = require('../utils/validator')

const router = express.Router()

router.route('/').get(autorize.onlyFounderOrAdmin, service.getAllUsers)

router.route('/:id').get(validator.idValidator, autorize.onlySpecificUser, service.getById)

module.exports = router
