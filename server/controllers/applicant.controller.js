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
        links: {
          self: `https://localhost:8000/api/applicants/${applicant.id}`,
        },
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

/**
 * @Controller verify applicant and save user
 */
const verifyUser = asyncHandler(async (req, res, next) => {
  try {
    // ? joi validate token
    const verificationToken = req.query

    await joiValidator.vierifyToken.validateAsync(verificationToken)

    // ? find applicant by token
    const applicant = await Applicant.findOne(verificationToken)

    // ! return 404 error if not found
    if (!applicant) return next(createHttpError(404, 'no users found'))

    // ? check token exp time
    const currentTime = Date.now()
    const canVerify = applicant.tokenExpTimes >= currentTime

    // ! return error and delete applicant if time is expired
    if (!canVerify) {
      await applicant.delete()
      return next(createHttpError(404))
    }

    const { firstName, lastName, email, password, gender, role, avatar } = applicant

    // ? check user is existed or not
    const isExistedUser = await User.findOne({ email })

    // ! if existed, return 400 error
    if (isExistedUser) {
      await applicant.delete()
      return next(createHttpError(400, 'User already existed!'))
    }

    // * upgrade applicant to user (save applicant to user)
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      gender,
      role,
      avatar,
    })
    const saveUser = await newUser.save()

    // ! if can't update, return 500 error
    if (!saveUser) return next(createHttpError(500))

    // todo ? if success, dlete applicant and send response
    res.status(200).json({
      meta: {
        message: 'Successfully verified',
      },
      links: {
        self: `https://localhost:8000/api/applicants/verificationToken/${applicant.verificationToken}`,
        user: `https://localhost:8000/api/users/${saveUser.id}`,
      },
    })
    return await applicant.delete()
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
})

module.exports = {
  getAllApplicants,
  createNewApplicant,
  applicantById,
  deleteApplicant,
  verifyUser,
}
