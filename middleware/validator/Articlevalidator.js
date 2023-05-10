const { param } = require('express-validator') //校验body
const validate = require('./errorBack') // 统一处理校验



module.exports.validatorId = validate(
  [
    param('id')
      .notEmpty().withMessage('Id不能为空').bail()
  ]
)