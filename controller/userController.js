// const { promisify } = require('util')
// const fs = require('fs')
// const rename = promisify(fs.rename) //修改文件名
const { User, Role, Permission } = require('../model/MongoTable')
// const Joi = require('joi'); //可以进行验证
const Bcrypt = require('../utils/md5') //加密解密
const jwt = require('../utils/jwt') //token
const Message = require('../middleware/Message')
class UserInstance {
  static userController = new UserInstance()
  /**
 * 注册
 */
  async getchannel (req, res) {
    let { username, password, email } = req.body

    // 验证请求数据的格式和完整性，不用中间件就可以用以下方式
    // const schema = Joi.object({
    //   username: Joi.string().required(),
    //   email: Joi.string().email().required(),
    //   password: Joi.string().min(8).required()
    // });
    // const { error, value } = schema.validate(req.body);
    // if (error) {
    //   throw new Error(error.details[0].message);
    // }
    // const { username, password, email } = value;

    // 对密码进行加密
    password = Bcrypt.encryption(password);
    // 属性必须和数据库设置的对应
    let data = {
      username,
      email,
      password,
    };

    let userModel = new User(data);
    const dbUser = await userModel.save();
    let user = dbUser.toJSON()
    delete user.password
    res.status(201).json({
      data: user,
      status: 201,
      message: '注册成功'
    })
  }

  /**
 * 登录
 */
  async login (req, res) {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ $or: [{ email: username }, { username: username }] }); //{ password: 0 } 0 代表不要查询密码
      if (!user) {
        return res.status(402).json({ status: 402, message: '无效的用户名或密码' });
      }
      const passwordMatches = await Bcrypt.verification(password, user.password);
      if (!passwordMatches) {
        return res.status(402).json({ status: 402, message: '无效的用户名或密码' });
      }
      user["password"] = undefined
      const token = jwt.generateToken(user) //存储token
      return res.status(200).json({ data: { token, id: user._id }, status: 200, message: '登录成功' });
    } catch (error) {
      return res.status(500).json({ error, status: 500, message: '出现了一些问题，请稍后再试' });
    }
  }


  /**
   * 获取用户列表
   */
  async getlList (req, res) {
    // // 进行分页处理
    const { page = 1, pageSize = 10 } = req.query
    const limit = Number(pageSize)
    const skip = (page - 1) * pageSize
    // try {
    //   let data = await User.find({}, { _id: 1, username: 1, profile: 1, mobile: 1, headimg: 1, role: 1, createTime: 1, roleIds: 1 }).skip(skip).limit(limit).lean()
    //   let roleName = []
    //   // data是一个mongoose对象，所以要转换成json对象，才能改变
    //   // 通过roleid将role表中的name取出来，然后添加到data中，返回给前端,用于显示角色名称，当roleIds中存储的是id时可以这样获取name
    //   // data = data.map(item => item.toJSON())

    //   for (let i = 0; i < data.length; i++) {
    //     for (let j = 0; j < data[i].roleIds.length; j++) {
    //       if (data[i].roleIds[j]) {
    //         const role = await Role.findById(data[i].roleIds[j], { name: 1 })
    //         if (role) {
    //           roleName.push(role.name)
    //         }
    //       }
    //     }
    //     data[i].roleName = roleName
    //     roleName = []
    //   }
    //   const total = await User.countDocuments()
    //   res.status(200).json({ data: data, total, status: 200, message: '获取成功' })
    // } catch (error) {
    //   res.status(500).json({ error, status: 500, message: '出现了一些问题，请稍后再试' });
    // }
    try {
      // aggregate的用法，aggregate是聚合管道，可以将多个操作放在一起执行，比如下面的$lookup和$project
      const users = await User.aggregate([
        {
          // $lookup是将两个表进行关联，这里是将user表和role表进行关联，然后将role表中的name取出来
          $lookup: {
            from: 'roles', //role表,这里的role是数据库中的表名，不是model中的表名，model中的表名是Role，数据库中的表名是roles
            localField: 'roleIds', //user表中的roleIds
            foreignField: '_id', //role表中的_id
            as: 'roles' //将role表中的name取出来，然后放到roles中
          }
        },
        //$project的用法，$project是将查询出来的数据进行筛选，只返回需要的数据，比如下面的_id:1，username:1等
        {
          $project: {
            _id: 1,
            username: 1,
            profile: 1,
            mobile: 1,
            headimg: 1,
            createTime: 1,
            roleIds: 1,
            roleName: '$roles.name' //这里的$roles.name是上面$lookup中的as: 'roles'，然后再取name
          }
        },
        // Skip and limit stage for pagination
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ]);
      const total = await User.countDocuments();
      res.status(200).json({ data: users, total, status: 200, message: '获取成功' });
    } catch (error) {
      res.status(500).json({ error, status: 500, message: '出现了一些问题，请稍后再试' });
    }
  }


  /**
   * 用户修改
   */
  async updatedUser (req, res) {
    // 通过id查找并修改,req.user在jwt处定义
    let id = req.user._id
    const updateData = await User.findByIdAndUpdate(id, req.body, { new: true }) //返回的更改之前的数据,第三个参数表示返回新的
    res.status(202).json({ status: 202, data: updateData, message: '修改成功' })
  }

  /**
 * 头像上传
 */
  async headimg (req, res) {
    console.log('req', req.file, req.user._id);
    // let fileFormat = req.file.originalname.lastIndexOf('.')
    // let format = req.file.originalname.slice(fileFormat)
    try {
      // rename(`./public/${req.url}` + req.file.filename, `./public/${req.url}` + req.file.filename + format) //修改文件名
      res.status(200).json({ destination: req.file.destination, filepath: req.file.filename, message: '上传成功' })
    } catch (err) {
      res.status(500).json({ error: err, message: Message.SERVER_ERROR })
    }
  }

  /**
   * 删除
   */
  async deleteUser (req, res) {
    let { id } = req.body
    try {
      await User.findByIdAndDelete(id)
      res.status(201).json({ status: 200, message: Message.DELETE_SUCCESS })
    } catch (err) {
      res.status(500).json({ status: 500, error: err, message: Message.SERVER_ERROR })
    }
  }

  /**
   * 根据指定获取用户
   */
  async getuser (req, res) {
    const id = req.query.id || req.user._id
    try {
      const orCondition = { $or: [{ _id: id }, { phone: id }, { username: id }] }
      let result = await User.findOne(orCondition)
      const role = await getPermissionPoints(result)
      result = result.toJSON()
      result.role = role
      if (result) {
        res.status(200).json({ status: 200, message: Message.USER_SELECT_SUCCESS, data: result })
      } else {
        res.status(201).json({ status: 201, message: Message.USER_NOT_FOUND, data: result })
      }
    } catch (err) {
      res.status(500).json({ status: 500, message: Message.SERVER_ERROR })
    }
  }

  /** 
   * 给用户分配角色
   */
  async assignRoles (req, res) {
    const { userId: id, roleIds } = req.body
    try {
      const user = await User.findById(id)
      if (user) {
        await User.findByIdAndUpdate(id, { roleIds }, { new: true })
        res.status(200).json({ status: 200, message: '分配角色成功' })
      } else {
        res.status(401).json({ status: 401, message: '当前用户不存在' })
      }
    } catch (err) {
      res.status(500).json({ status: 500, error: err })
    }
  }

}

// 获取权限点数据
const getPermissionPoints = async (ctx) => {
  let menus = [], points = []
  const permission = await Permission.find()
  if (ctx.mobile === '13800000000' || ctx.email === '1003823477@qq.com') {
    // 如果是管理员 则拥有所有的权限
    menus = permission.filter(item => item.pid === '0').map(item => item.code) // 所有的菜单的权限点
    points = permission.filter(item => item.pid !== '0').map(item => item.code) // 所有按钮的权限点
  } else {
    const roles = await Role.find()
    let pList = new Set() // 当前所有的权限点
    ctx.roleIds.forEach(roleId => {
      // 这里始终找不到，因为roleId是字符串，而_id是数字,所以要转化一下
      const currentRole = roles.find(item => item._id.toString() === roleId.toString())
      if (currentRole) {
        currentRole.permIds.forEach(id => {
          pList.add(id)
        })
      }
    })
    pList = [...pList] // 转化成数组
    pList.forEach(id => {
      const pObj = permission.find(p => p._id.toString() == id)
      if (pObj) {
        if (pObj.pid === '0') {
          menus.push(pObj.code)
        }
        if (pObj.pid !== '0') {
          points.push(pObj.code)
        }
      }
    })
  }
  return {
    menus,
    points,
    apis: []
  }
}
module.exports = UserInstance.userController