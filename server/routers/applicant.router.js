const express = require('express')
const controller = require('../controllers/applicant.controller')

const router = express.Router()

router.route('/').get(controller.getAllApplicants).post(controller.createNewApplicant)

router.route('/verify').get(controller.verifyUser)

router.route('/:id').get(controller.applicantById).delete(controller.deleteApplicant)

module.exports = router
