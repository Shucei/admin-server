const { User } = require('../model/MongoTable')
const Bcrypt = require('../utils/md5')
console.log('Bcrypt', User);
class UserInstance {
  static userController = new UserInstance()

  // 注册
  async getchannel (req, res) {
    let { username, password, email } = req.body
    // 对密码进行加密
    password = Bcrypt.encryption(password);
    // 属性必须和数据库设置的对应
    let data = {
      username,
      email,
      password,
    };
    return
    let userModel = new User(data);
    const dbUser = await userModel.save();
    let user = dbUser.toJSON()
    delete user.password
    res.status(201).json({
      data: user,
      message: '注册成功'
    })
  }
}

module.exports = UserInstance.userController