const { Role } = require('../model/MongoTable')

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
    console.log(skip, limit);
    try {
      const roles = await Role.find()
        .skip(skip)
        .limit(limit)
        .exec();
      res.json({
        success: true,
        data: roles,
        message: '获取角色列表成功'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
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
      res.status(500).json({ status: 500, error })
    }
  }

  /**
   * 给角色分配权限
   */
  async assignPrem (req, res) {
    const { id, permIds } = req.body
    try {
      await RoleModel.findByIdAndUpdate(id, { permIds })
      res.status(200).json({ status: 200, message: '分配权限成功' })
    } catch (error) {
      res.status(500).json({ status: 500, error })
    }
    json.message = "角色Id和更新permIds不能为空"
  }
}

module.exports = RolesInstance.rolesController

