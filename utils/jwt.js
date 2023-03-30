const jwt = require("jsonwebtoken");
let secret = "shujingshishuaiguo";
class jwtInstance {
  static jwt = new jwtInstance()
  // 生成token
  generateToken () {
    let payload = { id: id, time: new Date() };
    let token = jwt.sign(payload, secret, { expiresIn: 60 * 60 * 24 * 120 });
    return token;
  }
  // 解码token
  verifyToken () {
    let payload;
    jwt.verify(e, secret, function (err, result) {
      if (err) {
        payload = 0;
      } else {
        payload = 1;
      }
    });
    return payload;
  }
}
module.exports = jwtInstance.jwt
