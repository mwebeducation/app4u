// * import modules and custom modules
const mongoose = require('mongoose')
const config = require('../configs/general.config')
const sgMail = require('@sendgrid/mail')
const bcrypt = require('bcrypt')
const ejs = require('ejs')
const consola = require('consola')
const path = require('path')
const mongoosePaginate = require('mongoose-paginate-v2')
const fs = require('fs')
const jwt = require('jsonwebtoken')

// * important
const cwd = process.cwd() // current working dir

/**
 * @schema
 *
 * @required firstname,
 * @required lastname,
 * @required email,
 * @required passowrd: pre(hash),
 * @required genter,
 * @required role
 *
 * timespatms
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
      unique: true,
      required: true,
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
    role: {
      type: String,
      enum: ['Applicant', 'Admin', 'Developer', 'Founder', 'User'],
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret._id
        delete ret.password
        delete ret.__v
        return ret
      },
    },
  }
)

// update password if fid by id and update
schema.pre('update', async function (next) {
  try {
    const user = this
    if (user.isModified('password')) {
      const salt = await bcrypt.genSalt(config.saltLength)
      user.password = await bcrypt.hash(this.password, salt)
      return next()
    }
    return next()
  } catch (error) {
    return next(error)
  }
})

// ! send welcome email
schema.post('save', async (doc, next) => {
  try {
    // * read verifyMail.ejs template
    const templateObj = {
      firstName: doc.firstName,
      role: doc.role,
    }
    const template = await ejs.renderFile(
      path.join(cwd, 'templates', 'welcomeMail.ejs'),
      templateObj
    )

    // create mail obj
    const reciver = doc.email
    const sender = config.founder
    const msg = {
      to: reciver,
      from: sender, // Use the email address or domain you verified above
      subject: 'Warmly Welcome to App4U. Now your are one of our family.',
      text: `Welcome to App4You.`,
      html: template,
    }

    // * send mail
    return await sgMail.send(msg)
  } catch (err) {
    // ! return error
    consola.error(err.message)
    if (err.response) return next(err.response.body) && consola.error(err.response.body)
    return next(err)
  }
})

// ! validate match password fucntion
schema.methods.isMatchPassword = async function (input) {
  try {
    return await bcrypt.compare(input, this.password)
  } catch (err) {
    return Error(err)
  }
}

// ! generate jwt token
schema.methods.generateJwtToken = function () {
  const privateKey = fs.readFileSync(path.join(cwd, 'cert', 'jwt', 'jwt.pem'))

  const user = this

  const payloads = {
    id: user.id,
    role: user.role,
    password: user.password,
  }

  const options = { algorithm: config.jwtAlgorithm, expiresIn: '365d' }

  return jwt.sign(payloads, privateKey, options)
}

// ! get fullName from firstName and lastName
schema
  .virtual('displayName')
  .get(function () {
    return `${this.firstName} ${this.lastName}`
  })
  .set(function (v) {
    const firstName = v.substring(0, v.indexOf(' '))
    const lastName = v.substring(v.indexOf(' ') + 1)
    this.set({ firstName, lastName })
  })

schema.plugin(mongoosePaginate)

const User = mongoose.model('User', schema)

module.exports = User
