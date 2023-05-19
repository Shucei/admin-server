const express = require('express')
const router = express.Router()
const friendController = require('../controller/friendController')
const validator = require('../middleware/validator/Friendvalidator')
const jwt = require('../utils/jwt').verifyToken
const multer = require("multer"); //上传文件
const file = require('../utils/file') //配置上传的路径及文件夹，文件名
const upload = multer({ storage: file.storage, dest: 'public/' }); //配置上传的路径及文件夹，文件名
const url = require('url')

router
  .post("/add", jwt, validator.createFriend, friendController.Addfriend) // 添加好友
  .delete('/delete/:id', jwt, friendController.deleteFriend) //删除好友
  .get('/', jwt, friendController.findFriends)  // 获取好友列表
  .get('/:id', jwt, friendController.getDetails) //获取好友信息
  .post('/update', jwt, friendController.UpdateRemarks) //修改好友备注
  .post('/status', jwt, friendController.Refuse) // 拒绝好友或者同意好友
  .post('/lastmessage', jwt, friendController.getLastMessageAndUnreadCount) //获取最后一条消息
  .post('/send', jwt, friendController.sendMessage) //发送消息
  .post('/message', jwt, friendController.getMessage) //获取消息
  .put('/upmessage', jwt, friendController.updateMessage) //修改消息状态
  .post('/upload', upload.single('file'), friendController.upload) //上传文件
  .post('/upload-audio', jwt, upload.single('audioFile'), (req, res) => {
    // req.file 包含上传的文件信息，可以根据需要进行处理和存储
    const recording = url.format({
      protocol: req.protocol,
      hostname: req.hostname,
      port: req.socket.localPort,
      pathname: req.file.path.replace(/^\/+/g, '')
    });
    // 在这里可以将文件存储到指定位置，如将其移动到持久化的目录或将其上传到云存储服务
    res.status(200).json({
      status: 200,
      message: '上传成功',
      data: recording
    })
  });
module.exports = router