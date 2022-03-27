const Applicant = require('../models/Applicant.model')
const asyncHandler = require('express-async-handler')
const createHttpError = require('http-errors')
const joiValidator = require('../utils/joi.validator')
const mongoose = require('mongoose')
const User = require('../models/User.model')

/**
 * @Controller get all applicants
 */
const getAllApplicants = asyncHandler(async (req, res, next) => {
  try {
    // todo: validate req param (pagination)

    // ? find applicant from db
    const applicants = await Applicant.paginate()

    const {
      totalDocs,
      docs,
      limit,
      hasPrevPage,
      hasNextPage,
      page,
      totalPages,
      offset,
      prevPage,
      nextPage,
      pagingCounter,
    } = applicants

    // * return data
    if (totalDocs < 1)
      return res.status(200).json({
        data: {
          meta: {
            total: totalDocs,
            message: 'No Applicants',
          },
        },
      })

    // * return data
    return res.status(200).json({
      data: {
        meta: {
          total: totalDocs,
          limit,
          hasPrevPage,
          hasNextPage,
          page,
          totalPages,
          offset,
          prevPage,
          nextPage,
          pagingCounter,
        },
        applicants: docs,
        links: {
          self: 'https://localhost:8000/api/applicants',
        },
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

    // ? find req email is existed in user
    const isExistedUser = await User.findOne({ email: info.email })

    // ! if exist, return 400 error
    if (isExistedUser) return next(createHttpError(400, 'User already existed with that mail!'))

    // * save user to db
    const newApplicant = new Applicant(info)
    const savedApplicant = await newApplicant.save()

    // ! return if error
    if (!savedApplicant) return next(createHttpError(409))

    // * if applicant is saved, send verification mail
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
          links: {
            self: 'https://localhost:8000/api/applicants',
            applicants: 'https://localhost:8000/api/applicants',
            applicant: `https://localhost:8000/api/applicants/${savedApplicant.id}`,
          },
        },
      })
      .end()
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
})

/**
 * @Controller get applicant by id
 */
const applicantById = asyncHandler(async (req, res, next) => {
  try {
    // ? validate req id is mongo id
    const id = req.params.id
    const isMongoId = await mongoose.Types.ObjectId.isValid(id)

    // ! if id is not mongo id , return 422 error
    if (!isMongoId) return next(createHttpError(404))

    // ? find applicant is existed
    const applicant = await Applicant.findById(id)

    // ! if not exist, return 404 error
    if (!applicant) return next(createHttpError(404))

    // * return applicant data
    return res.status(200).json({
      data: {
        meta: {
          id: applicant.id,
        },
        applicant,
      },
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * @Controller delete applicant by id
 */
const deleteApplicant = asyncHandler(async (req, res, next) => {
  try {
    // ? validate req id is mongo id
    const id = req.params.id
    const isMongoId = await mongoose.Types.ObjectId.isValid(id)

    // ! if id is not mongo id , return 422 error
    if (!isMongoId) return next(createHttpError(404))

    // ? find and delte applicant is existed
    const applicant = await Applicant.findByIdAndDelete(id)

    // ! if not exist, return 404 error
    if (!applicant) return next(createHttpError(404))

    return res.status(200).json({
      data: {
        meta: {
          message: 'Successfully deleted',
        },
        links: {
          self: `https://localhost:8000/api/applicants/${applicant.id}`,
        },
      },
    })
  } catch (err) {
    return next(err)
  }
})

module.exports = {
  getAllApplicants,
  createNewApplicant,
  applicantById,
  deleteApplicant,
}
