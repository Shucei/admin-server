const { body, param } = require('express-validator') //校验
const validate = require('./errorBack') // 统一处理校验
const { Role, Permission } = require('../../model/MongoTable')

// bail进行拦截，错了就不需要执行后面
module.exports.createRolevali = validate(
  [
    body('name')
      .notEmpty().withMessage('角色名不能为空').bail()
      .isLength({ min: 3 }).withMessage('用户名长度不能小于3').bail()
      .custom(async val => {
        // 自定义校验规则，进行用户邮箱查重
        const result = await Role.countDocuments({ name: val })
        if (result) {
          return Promise.reject('角色名已存在')
        }
      }).bail(),
    body('description')
      .notEmpty().withMessage('描述不能为空').bail()
  ]
)

module.exports.AssignRole = validate(
  [
    body('id')
      .notEmpty().withMessage('Id不能为空').bail(),
    body('permIds')
      .notEmpty().withMessage('更新permIds不能为空').bail()
  ]
)

module.exports.addPermissions = validate(
  [
    body('name')
      .notEmpty().withMessage('权限名不能为空').bail()
      .custom(async val => {
        // 自定义校验规则，进行用户邮箱查重
        const result = await Permission.countDocuments({ name: val })
        if (result) {
          return Promise.reject('权限名已存在')
        }
      }).bail(),
    body('code')
      .notEmpty().withMessage('标识不能为空').bail(),
    body('description')
      .notEmpty().withMessage('描述不能为空').bail()
  ]
)

module.exports.delPermissions = validate(
  [
    param('id')
      .notEmpty().withMessage('Id不能为空').bail()
  ]
)


