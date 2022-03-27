const User = require('../models/User.model')
const asyncHandler = require('express-async-handler')
const createHttpErr = require('http-errors')
const mongoose = require('mongoose')

/**
 * @Controller get all applicants
 * only admin or founder can request this service
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    // todo: validate req param (pagination)

    // ? find applicant from db
    const applicants = await User.paginate()

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
            message: 'No Users',
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
          self: 'https://localhost:8000/api/users',
        },
      },
    })
  } catch (err) {
    if (err.isJoi) err.status = 422
    return next(err)
  }
})

module.exports = {
  getAllUsers,
}
