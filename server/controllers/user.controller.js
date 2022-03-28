const User = require('../models/User.model')
const asyncHandler = require('express-async-handler')
const createHttpError = require('http-errors')

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
 * @Controller get user by id
 * can request logined user, admin or founder
 */
const getById = asyncHandler(async (req, res, next) => {
  try {
    // get user
    const id = req.params.id

    const user = await User.findById(id)

    // * return user data
    return res.status(200).json({
      data: {
        meta: {
          id: user.id,
        },
        user,
        links: {
          self: `https://localhost:8000/api/users/${user.id}`,
        },
      },
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * @Controller update user password
 * can request logined user
 */
const updatePassword = asyncHandler(async (req, res, next) => {
  try {
    const info = req.body

    // find user
    const user = await User.findById(info.id)

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
          self: `https://localhost:8000/api/users/update_password`,
          user: `https://localhost:8000/api/users/${req.user.id}`,
        },
      },
    })
  } catch (err) {
    return next(err)
  }
})

/**
 * @Controller update user email
 * con request only user
 */
const updateEmail = asyncHandler(async (req, res, next) => {
  try {
    const id = req.user.id

    const obj = req.body

    // ? find user by id
    const user = await User.findById(id)

    // ? validate password is match
    const isMatchPassword = await user.isMatchPassword(obj.password)

    // ! return 403 error, if not match password
    if (!isMatchPassword) return next(createHttpError(403))

    // * send response verify token
    const verifyUpdateEmail = await user.verifyUpdateEmail(obj.newEmail)

    if (!verifyUpdateEmail) return next(createHttpError(500))

    return res.status(200).json({
      data: {
        meta: {
          id: user.id,
          message: `Please verify token we sent to ${user.email}`,
        },
        links: {
          self: `https://localhost:8000/api/users/update_email`,
          user: `https://localhost:8000/api/users/${req.user.id}`,
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
  updateEmail,
}
