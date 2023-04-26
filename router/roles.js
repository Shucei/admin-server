const express = require('express')
const router = express.Router()
const rolesController = require('../controller/rolesController')
const validator = require('../middleware/validator/Rolevalidator')
const jwt = require('../utils/jwt').verifyToken


router
  .post("/add", jwt, validator.createRolevali, rolesController.createRole) // 新增角色
  .delete('/delete/:id', jwt, rolesController.deleteRole) //删除角色
  .get('/', jwt, rolesController.getRoles)  //获取角色列表
  .get('/:id', jwt, rolesController.getDetails) //获取角色详情
  .put('/update/:id', jwt, validator.createRolevali, rolesController.UpdateRole) //更新角色
  .post('/assignPrem', jwt, validator.AssignRole, rolesController.assignPrem) //分配权限
  .post('/permission', jwt, rolesController.getPermission) //获取所有权限点
  .put('/permission', jwt, validator.addPermissions, rolesController.addPermissions) //添加权限点
  .delete('/permission/:id', jwt, validator.delPermissions, rolesController.delPermissions) //删除权限点
  .get('/permission/:id', jwt, rolesController.getPermissionDetails) //获取权限详情
  .put('/uppermission/:id', jwt, validator.addPermissions, rolesController.updatePermission) //更新权限点
module.exports = router