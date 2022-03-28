const express = require('express')
const service = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')
const router = express.Router()

router.route('/').get(service.getAllUsers)

router.route('/:id').get(authController.autorizeOnlySpecificUser, service.getById)

module.exports = router
