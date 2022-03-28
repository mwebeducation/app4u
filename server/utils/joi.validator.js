const joi = require('joi')

module.exports = {
  // ? validate GET : app applicants pagination
  // getAllPagination: joi.object().keys(
  //   {
  //     limit: joi.string()
  //   }
  // ),
  // ? validate POST : create new applicant
  register: joi.object().keys({
    firstName: joi.string().min(2).max(30).required(),
    lastName: joi.string().min(2).max(30).required(),
    email: joi.string().email().trim().lowercase().required(),
    password: joi.string().min(6).max(30).required(),
    confirmPassword: joi.string().min(6).max(30).required().valid(joi.ref('password')),
    gender: joi.string().valid('Male', 'Female').required(),
    role: joi.string().valid('User', 'Developer', 'Admin').required(),
  }),
  // ? validate GET : verify applicant by token
  vierifyToken: joi.object().keys({
    verificationToken: joi.string().hex().required(),
  }),
  // ? valitae POST : user password
  passwordValidtor: joi.object().keys({
    oldPassword: joi.string().min(6).max(30).required(),
    newPassword: joi.string().min(6).max(30).required(),
    confirmNewPassword: joi.string().min(6).max(30).required().valid(joi.ref('newPassword')),
  }),
  // ? validate POST : user email
  newEmailValidator: joi.object().keys({
    newEmail: joi.string().email().trim().lowercase().required(),
    password: joi.string().min(6).max(30).required(),
  }),
  // ? validate POST: login user
  login: joi.object().keys({
    email: joi.string().email().lowercase().trim().required(),
    password: joi.string().min(6).max(30).required(),
  }),
}
