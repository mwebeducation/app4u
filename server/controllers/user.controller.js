const User = require('../models/User.model')
const asyncHandler = require('express-async-handler')
const joiValidator = require('../utils/joi.validator')
const createHttpError = require('http-errors')
// const createHttpErr = require('http-errors')

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

/**
 * @Controller update user email
 * can request logined user
 */

/**
 * @Controller update user password
 * can request logined user
 */
const updatePassword = asyncHandler(async (req, res, next) => {
  try {
    // validate by joi
    const info = req.body
    await joiValidator.passwordValidtor.validateAsync(info)

    // find user
    const user = await User.findById(req.params.id)

    // check old password is correct
    const isMatchPassword = await user.isMatchPassword(info.oldPassword)

    if (!isMatchPassword) return next(createHttpError(403, 'Incorrect password!'))

    // update password
    const updatedUser = await user.update({ passowrd: info.newPassword })

    if (!updatedUser) return next(createHttpError(409, "Can't update password"))

    return res.status(200).json({
      data: {
        meata: {
          message: 'Successfully updated your new password',
        },
        links: {
          self: `https://localhost:8000/api/users/update_password/${req.parmas.id}`,
          user: `https://localhost:8000/api/users/${req.params.id}`,
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
  updatePassword,
}
