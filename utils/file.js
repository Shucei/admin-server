// 引入附件上传插件
const multer = require("multer");
const mkdir = require("../utils/mkdir");

exports.storage = multer.diskStorage({
  //保存路径
  destination: function (req, file, cb) {
    // 处理路径，如头像，群头像，聊天的文件都是不同的路径
    let url = req.url;
    // 先创建文件夹，然后在进行上传
    mkdir.mkdirs("../public/" + url, (err) => {
      console.log(err);
    });
    cb(null, "./public/" + url);
    //注意这里的文件路径,不是相对路径，直接w填写从项目根路径开始写就行了
  },
  //保存在 destination 中的文件名
  filename: function (req, file, cb) {
    // 如果上传的是头像，就覆盖原来的，就不能使用时间戳
    let type = file.originalname.replace(/.+\./, ".");
    if (req.url === "/headimg") {
      cb(null, req.user._id + type);
    } else {
      // 通过正则改变文件名字
      cb(null, Date.now() + type);
    }
  },
});