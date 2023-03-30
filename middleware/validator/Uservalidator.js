const { body, validationResult } = require('express-validator') //校验


module.exports.register = [body('username').notEmpty().withMessage('用户名不能为空').isLength({ min: 3 }).withMessage('用户名长度不能小于3'),
body('email').notEmpty().withMessage('邮箱不能为空').isEmail().withMessage('邮箱格式错误')]

