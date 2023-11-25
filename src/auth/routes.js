const express = require('express')
const app = express()
const controller = require('./controllers')

app.post('/register', controller.register)

module.exports = app