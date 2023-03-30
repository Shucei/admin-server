const { User } = require('../model/MongoTable')
// const Joi = require('joi'); //可以进行验证
const Bcrypt = require('../utils/md5')
const jwt = require('../utils/jwt')
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
      return res.status(200).json({ data: user, token, status: 200, message: '登录成功' });
    } catch (error) {
      return res.status(500).json({ error, status: 500, message: '出现了一些问题，请稍后再试' });
    }
  }

  /**
   * 获取用户列表
   */
  getlList (req, res) {
    res.json('6666')
  }
}
module.exports = UserInstance.userController