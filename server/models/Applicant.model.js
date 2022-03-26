const bcrypt = require('bcrypt')
const mongoose = require('bcrypt')
const moment = require('moment')
const config = require('../configs/general.config')
/**
 * @Schema
 */
const schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      min: 3,
      max: 20,
      required: true,
    },
    lastName: {
      type: String,
      min: 3,
      max: 20,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: false,
      required: true,
      index: false,
      sparse: false,
    },
    password: {
      type: String,
      min: 6,
      max: 60,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true,
    },
    avatar: {
      type: String,
      default: '/public/default_avatar.svg',
    },
    role: {
      type: String,
      enum: ['Applicant', 'Admin', 'Developer', 'Founder', 'User'],
      default: 'Applicant',
    },
    verificationToken: {
      type: String,
      default: '',
    },
    tokenExpTimes: {
      type: Date,
      default: moment().add(6, 'm').format(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret._id
        delete ret.password
        delete ret.verificationToken
        delete ret.tokenExpTime
        delete ret.__v
        return ret
      },
    },
  }
)

// ! hash password and create verifiation token
schema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next()
    // * generate salt
    const salt = await bcrypt.genSalt(config.saltLength)
    const preHash = await bcrypt.hash(this.password, salt)
    const finalHash = await bcrypt.hash(preHash, salt)
    this.password = await bcrypt.hash(finalHash, salt)

    // * generate verification token
    // this.verificationToken = tokenGenerator();

    return next()
  } catch (err) {
    return next(err)
  }
})

// ! validate match password fucntion
schema.methods.isMatchPassword = async function (input) {
  try {
    const salt = await bcrypt.genSalt(config.saltLength)
    const preHash = await bcrypt.hash(input, salt)
    return await bcrypt.compare(preHash, this.password)
  } catch (err) {
    return Error(err)
  }
}

// get full name
schema
  .virtual('fullName')
  .get(function () {
    return `${this.firstName} ${this.lastName}`
  })
  .set(function (v) {
    const firstName = v.substring(0, v.indexOf(' '))
    const lastName = v.substring(v.indexOf(' ') + 1)
    this.set({ firstName, lastName })
  })

const Applicant = mongoose.model('Applicant', schema)

module.exports = Applicant
