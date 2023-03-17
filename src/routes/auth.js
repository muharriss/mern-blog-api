const express = require('express')
const { body } = require('express-validator')
const app = express()
const authController = require('../controllers/auth')

app.post('/register',
    [body('username').isLength({ min: 3, max:20 }).withMessage('username minimal 3 karakter')],
    [body('password').isLength({ min: 5 }).withMessage('password minimal 5 karakter')],
    authController.userRegister)

app.post('/login',authController.userLogin)

module.exports = app