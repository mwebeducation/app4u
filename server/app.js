const express = require('express')

const app = express()

/**
 *
 * @Main @Function
 */

const main = () => {
  // testing
  app.get('/', (req, res, next) => {
    res.send('hello world')
  })
}

main()

module.exports = app
