const express = require('express')
const controller = require('../controllers/user.controller')

const router = express.Router()

router.route('/').get(controller.getAllUsers)

module.exports = router
