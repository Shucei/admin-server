const express = require('express')
const router = express.Router()
const friendController = require('../controller/friendController')
const validator = require('../middleware/validator/Friendvalidator')
const jwt = require('../utils/jwt').verifyToken


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
module.exports = router