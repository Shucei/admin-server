const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const validator = require('../middleware/validator/Uservalidator')
const jwt = require('../utils/jwt').verifyToken



router

module.exports = router 