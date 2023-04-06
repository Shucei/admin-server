const express = require('express')
const router = express.Router()
const rolesController = require('../controller/rolesController')
const validator = require('../middleware/validator/Rolevalidator')
const jwt = require('../utils/jwt').verifyToken


router
  .post("/add", jwt, validator.createRolevali, rolesController.createRole) // 新增角色
  .get('/', jwt, rolesController.getRoles)  //获取角色列表
  .put('/assignPrem', jwt, validator.AssignRole, rolesController.assignPrem) //分配权限
module.exports = router 