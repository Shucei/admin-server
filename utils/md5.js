const bcrypt = require("bcryptjs");
class Bcrypt {
  static newBcrypt = new Bcrypt()
  // 生成hash密码随机的salt
  encryption (e) {
    const salt = bcrypt.genSaltSync(10);
    // 生成hash密码
    let hash = bcrypt.hashSync(e, salt);
    return hash;
  }

  // 解密
  verification (e, hash) {
    const verif = bcrypt.compareSync(e, hash);
    return verif;
  }
}
module.exports = Bcrypt.newBcrypt
