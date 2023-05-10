const jwt = require("jsonwebtoken");
let secret = "shujingshishuaiguo"; //私钥
class jwtInstance {
  static jwt = new jwtInstance()
  // 生成token
  generateToken (id) {
    let payload = { id };
    let token = jwt.sign(payload, secret, { expiresIn: 60 * 60 * 24 }); //设置一个小时
    return token;
  }
  // 解码token
  verifyToken (req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ status: 401, error: '身份验证失败' });
    }
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ status: 401, error: '身份验证失败' });
      }
      req.user = decoded.id;
      next();
    });
  }
}
module.exports = jwtInstance.jwt
