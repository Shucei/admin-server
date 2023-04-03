const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const validator = require('../middleware/validator/Uservalidator')
const jwt = require('../utils/jwt').verifyToken
const multer = require('multer')
const upload = multer({ dest: 'public/' })
// 校验规则
/**
 *   .post('/register',
    body('username').notEmpty().withMessage('用户名不能为空').bail().isLength({ min: 3 }).withMessage('用户名长度不能小于3').bail(),
    body('email').notEmpty().withMessage('邮箱不能为空').bail().isEmail().withMessage('邮箱格式错误'),
    (req, res, next) => {
      const error = validationResult(req)
      if (!error.isEmpty()) {
        return res.status(401).json({ error: error.array() })
      }
      next()
    },
    userController.getchannel)
 */
router
  .post('/register',
    validator.register,
    userController.getchannel)
  .post('/login', validator.login, userController.login)
  .get('/lists', jwt, userController.getlList)
  .put('/', jwt, validator.update, userController.updatedUser)
  .post('/headimg', jwt, upload.single('headimg'), userController.headimg)
  .delete('/', jwt, userController.deleteUser)
module.exports = router 
