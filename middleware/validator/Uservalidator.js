const { body } = require('express-validator') //校验
const validate = require('./errorBack') // 统一处理校验
const { User } = require('../../model/MongoTable')

// bail进行拦截，错了就不需要执行后面
module.exports.register = validate(
  [
    body('username')
      .notEmpty().withMessage('用户名不能为空').bail()
      .isLength({ min: 3 }).withMessage('用户名长度不能小于3').bail()
      .custom(async val => {
        // 自定义校验规则，进行用户邮箱查重
        const result = await User.countDocuments({ username: val })
        if (result) {
          return Promise.reject('用户名已注册')
        }
      }),
    body('email')
      .notEmpty().withMessage('邮箱不能为空').bail()
      .isEmail().withMessage('邮箱格式错误').bail()
      .custom(async val => {
        // 自定义校验规则，进行用户邮箱查重
        const result = await User.countDocuments({ email: val })
        if (result) {
          return Promise.reject('邮箱已被注册')
        }
      }).bail()
  ]
)

module.exports.login = validate(
  [
    body('username')
      .notEmpty().withMessage('用户名不能为空').bail()
      .isLength({ min: 3 }).withMessage('用户名长度不能小于3').bail()
      .custom(async val => {
        // 自定义校验规则，进行用户邮箱查重
        const result = await User.findOne({ $or: [{ email: val }, { username: val }] })
        if (!result) {
          return Promise.reject('无效的用户名或密码')
        }
      }),
    body('password')
      .notEmpty().withMessage('密码不能为空')
  ]
)

module.exports.update = validate(
  [
    body('email')
      // .isEmail().withMessage('邮箱格式错误').bail()
      .custom(async val => {
        // 自定义校验规则，进行用户邮箱查重
        const result = await User.countDocuments({ email: val })
        if (result) {
          return Promise.reject('邮箱已被注册')
        }
      }).bail(),
    body('username')
      .custom(async val => {
        // 自定义校验规则，进行用户邮箱查重
        const result = await User.findOne({ username: val })
        if (result) {
          return Promise.reject('用户名已存在')
        }
      }).bail(),
    body('phone')
      .custom(async val => {
        // 自定义校验规则，进行用户邮箱查重
        const result = await User.countDocuments({ phone: val })
        if (result) {
          return Promise.reject('手机号已被注册')
        }
      }).bail()
  ]
)
