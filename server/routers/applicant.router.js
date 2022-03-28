const express = require('express')
const service = require('../controllers/applicant.controller')

const router = express.Router()

router.route('/').get(service.getAllApplicants).post(service.createNewApplicant)

router.route('/verify').get(service.verifyUser)

router.route('/:id').get(service.applicantById).delete(service.deleteApplicant)

module.exports = router
