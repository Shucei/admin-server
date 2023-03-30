const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const { body, validationResult } = require('express-validator') //校验
const validator = require('../middleware/validator/Uservalidator')
router
  .post('/register',
    ...validator.register,
    (req, res, next) => {
      const error = validationResult(req)
      console.log(error);
    },
    userController.getchannel)

module.exports = router 
