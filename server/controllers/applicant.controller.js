const Applicant = require('../models/Applicant.model')
const asyncHandler = require('express-async-handler')
const createHttpError = require('http-errors')
const joiValidator = require('../utils/joi.validator')

/**
 * @Controller get all applicants
 */
const getAllApplicants = asyncHandler(async (req, res, next) => {
  try {
    // todo: validate req param (pagination)

    // ? find applicant from db
    const applicants = await Applicant.find()

    // * return data
    if (applicants.length < 1)
      return res.status(200).json({
        data: {
          meta: {
            length: applicants.length,
            message: 'No Applicants',
          },
        },
      })

    // * return data
    return res.status(200).json({
      data: {
        meta: {
          length: applicants.length,
        },
        applicants: [applicants],
      },
    })
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
})

/**
 * @Controller create new applicant
 */
const createNewApplicant = asyncHandler(async (req, res, next) => {
  try {
    // ? validate req body
    const info = await joiValidator.register.validateAsync(req.body)

    // todo ? find req email is existed in user

    // todo ! if exist, return 400 error

    // * save user to db
    const newApplicant = new Applicant(info)
    const savedApplicant = await newApplicant.save()

    // ! return if error
    if (!savedApplicant) return next(createHttpError(409))

    // if applicant is saved, send verification mail
    await savedApplicant.sentVerifyMail()

    // * return success messge
    return res
      .status(201)
      .json({
        data: {
          meta: {
            id: savedApplicant.id,
            message: 'Please verify your email',
          },
        },
      })
      .end()
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
})

module.exports = {
  getAllApplicants,
  createNewApplicant,
}
