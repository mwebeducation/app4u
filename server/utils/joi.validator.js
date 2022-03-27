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
    verificationToken: joi.string().min(30).max(35).hex().required(),
  }),
}
