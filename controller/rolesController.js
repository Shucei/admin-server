const { Role, Permission, User } = require('../model/MongoTable')
const { assignRoles } = require('./userController')
const Message = require('../middleware/Message')
class RolesInstance {
  static rolesController = new RolesInstance()
  /**
   * 获取角色列表
   */
  async getRoles (req, res) {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    try {
      const roles = await Role.find({}, { _id: 1, name: 1, permIds: 1, description: 1, })
        .skip(skip)
        .limit(limit)
        .exec();
      const total = await Role.countDocuments()
      res.json({
        status: 200,
        success: true,
        total,
        data: roles,
        message: '获取角色列表成功'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }


  /**
   * 添加角色
   */
  async createRole (req, res) {
    const newRole = req.body
    try {
      let obj = await Role.create(newRole)
      res.status(200).json({ status: 200, message: '新增角色成功', data: obj })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  /**
   * 删除角色
   */
  async deleteRole (req, res) {
    const id = req.params.id
    try {
      await User.updateMany({ roleIds: id }, { $pull: { roleIds: id } })
      await Role.findByIdAndDelete(id)
      // 删除角色的同时，删除用户中存在该角色的用户，此时roleIds中存的是角色对象
      // $pull 删除数组中的指定元素,第一个参数是要删除的数组，第二个参数是要删除的元素
      // updateMany 更新多个文档,第一个参数是查询条件，第二个参数是更新的内容,第三个参数是回调函数
      // 1.先查找用户中的角色，然后删除角色中的id
      // 2.然后更新用户中的角色
      // $elemMatch的作用是匹配数组中的元素，然后返回整个文档
      // $pull的作用是删除数组中的指定元素
      // await User.updateMany({ roleIds: { $elemMatch: { _id: id } } }, { $pull: { roleIds: { _id: id } } })
      res.status(200).json({ status: 200, message: '删除角色成功' })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }


  /**
   * 获取角色详情
   */
  async getDetails (req, res) {
    const id = req.params.id
    try {
      let item = await Role.findById(id)
      if (item) {
        res.status(200).json({ status: 200, message: '查询角色详情成功', data: item })
      } else {
        res.status(201).json({ status: 201, message: '查询角色详情失败' })
      }
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  /**
   * 更新角色
   */
  async UpdateRole (req, res) {
    const id = req.params.id
    const newRole = req.body
    try {
      const result = await Role.findByIdAndUpdate(id, newRole, { new: true })
      if (!result) {
        res.status(404).json({ message: '角色不存在' });
      }
      res.status(200).json({ status: 200, message: '更新角色成功' })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  /**
   * 给角色分配权限
   */
  async assignPrem (req, res) {
    const { id, permIds } = req.body
    try {
      await Role.findByIdAndUpdate(id, { permIds })
      res.status(200).json({ status: 200, message: '分配权限成功' })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  /**
   * 获取权限列表
   */
  async getPermission (req, res) {
    try {
      let rows = await Permission.find()
      res.status(200).json({ status: 200, message: '获取权限点成功', data: rows })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }


  /**
   * 添加权限点
   */
  async addPermissions (req, res) {
    const newPermission = req.body
    try {
      let obj = await Permission.create(newPermission)
      res.status(200).json({ status: 200, message: '添加权限点成功', data: obj })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  /**
   * 删除权限点
   */
  async delPermissions (req, res) {
    const id = req.params.id
    try {
      await Permission.findByIdAndDelete(id)
      res.status(200).json({ status: 200, message: '删除权限点成功' })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  /**
   * 获取权限详情
   */
  async getPermissionDetails (req, res) {
    const id = req.params.id
    if (id) {
      const obj = await Permission.findById(id).lean()
      res.status(200).json({ status: 200, message: '获取成功', data: obj })
    } else {
      res.status(400).json({ status: 400, message: '权限点标识不能为空' })
    }
  }

  /**
   * 更新权限点
   */
  async updatePermission (req, res) {
    const id = req.params.id
    const newPermission = req.body
    let obj = await Permission.findByIdAndUpdate(id, newPermission, { new: true })
    res.status(200).json({ status: 200, message: '更新权限点成功', data: obj })
  }

}

module.exports = RolesInstance.rolesController

