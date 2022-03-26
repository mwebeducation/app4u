const Applicant = require('../models/Applicant.model')
const asyncHandler = require('express-async-handler')
const createHttpError = require('http-errors')

/**
 * @Controller get all users from db
 */
const getAllApplicants = asyncHandler(async (req, res, next) => {
  try {
    const applicants = await Applicant.find()
    if (applicants.length < 1)
      return res.status(200).json({
        data: {
          meta: {
            length: applicants.length,
            message: 'No Applicants',
          },
        },
      })

    return res.status(200).json({
      data: {
        meta: {
          length: applicants.length,
        },
        applicants: [applicants],
      },
    })
  } catch (err) {
    return next(err)
  }
})

module.exports = {
  getAllApplicants,
}
