const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const moment = require('moment')
const config = require('../configs/general.config')
const tokenGenerator = require('../utils/tokenGenerator')
const sgMail = require('@sendgrid/mail')
const ejs = require('ejs')
const path = require('path')
const consola = require('consola')
const mongoosePaginate = require('mongoose-paginate-v2')

const cwd = process.cwd() // current working directory

/**
 * @Schema
 */
const Schema = mongoose.Schema

const schema = new Schema(
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
    this.verificationToken = tokenGenerator()

    return next()
  } catch (err) {
    return next(err)
  }
})

// ! send verify mail method function
schema.methods.sentVerifyMail = async function () {
  try {
    // * read verifyMail.ejs template
    const templateObj = {
      verificationLink: `https://localhost:4000/api/applicant/verify/${this.verificationToken}`,
      firstName: this.firstName,
    }
    const template = await ejs.renderFile(
      path.join(cwd, 'templates', 'verifyMail.ejs'),
      templateObj
    )

    // create mail obj
    const reciver = this.email
    const sender = config.founder
    const msg = {
      to: reciver,
      from: sender, // Use the email address or domain you verified above
      subject: 'Please Verify Your Email',
      text: `Welcome to App4You.`,
      html: template,
    }

    // * send mail
    return await sgMail.send(msg)
  } catch (err) {
    // ! return error
    consola.error(err.message)
    if (err.response) return consola.error(err.response.body)
    throw new Error(err)
  }
}

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

// * get full name
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

schema.plugin(mongoosePaginate)

const Applicant = mongoose.model('Applicant', schema)

module.exports = Applicant
