const { body, param } = require('express-validator') //校验
const validate = require('./errorBack') // 统一处理校验
const { Article } = require('../../model/MongoTable')


module.exports.validatorId = validate(
  [
    param('id')
      .notEmpty().withMessage('Id不能为空').bail()
  ]
)