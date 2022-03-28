const express = require('express')
const service = require('../controllers/applicant.controller')
const validator = require('../utils/validator')
const autorize = require('../controllers/auth.controller')

const router = express.Router()

router
  .route('/')
  .get(autorize.onlyFounderOrAdmin, service.getAllApplicants)
  .post(validator.register, service.createNewApplicant)

router.route('/verify').get(validator.verifyToken, service.verifyUser)

router
  .route('/:id')
  .get(validator.idValidator, autorize.onlyFounderOrAdmin, service.applicantById)
  .delete(validator.idValidator, autorize.onlyFounderOrAdmin, service.deleteApplicant)

module.exports = router
