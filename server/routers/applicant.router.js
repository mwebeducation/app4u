const express = require('express')
const controller = require('../controllers/applicant.controller')

const router = express.Router()

router.route('/').get(controller.getAllApplicants).post(controller.createNewApplicant)

module.exports = router
