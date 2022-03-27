const User = require('../models/User.model')
const asyncHandler = require('express-async-handler')
const createHttpErr = require('http-errors')
const mongoose = require('mongoose')

/**
 * @Controller get all users
 * only admin or founder can request this service
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    // todo: validate req param (pagination)

    // ? find applicant from db
    const users = await User.paginate()

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
    } = users

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
        users: docs,
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

/**
 * @Controller get all users
 * can request logined user, admin or founder
 */
const getById = asyncHandler(async (req, res, next) => {
  try {
    // find user and return data
    const id = req.params.id
    const user = await User.findById(id).exec()

    // * return user data
    return res.status(200).json({
      data: {
        meta: {
          id: user.id,
        },
        user,
        links: {
          self: `https://localhost:8000/api/users/${id}`,
        },
      },
    })
  } catch (err) {
    return next(err)
  }
})

module.exports = {
  getAllUsers,
  getById,
}
