/* eslint-disable no-unused-vars */
const { Friend, MsgSchema } = require('../model/MongoTable')
const Message = require('../middleware/Message')
class FriendInstance {
  static friendController = new FriendInstance()
  // 添加好友
  async Addfriend (req, res) {
    try {
      const { userID, friendID, message } = req.body
      const data = await Friend.create({ userID, friendID, status: 0 })
      if (data) {
        const msg = await MsgSchema.create({ sender_id: userID, receiver_id: friendID, content: message, types: 0 })
        if (msg) {
          res.status(200).json({ status: 200, message: '消息发送成功' })
        }
      }
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 删除好友
  async deleteFriend (req, res) {
    try {
      const { id } = req.params
      const data = await Friend.findByIdAndDelete(id)
      res.status(200).json({ status: 200, message: '删除成功' })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 获取好友列表
  async findFriends (req, res) {
    try {
      const { userID } = req.body
      const friends = await Friend.find({ $or: [{ userID }, { friendID: userID }], status: 1 }); // 查询好友列表,状态为1的,即已经是好友的,并且是当前用户的好友,或者是当前用户添加的好友
      res.status(200).json({ status: 200, message: '好友列表获取', data: friends })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 获取好友信息
  async getDetails (req, res) {
    const { id } = req.params
    try {
      const data = await Friend.findById(id)
      res.status(200).json({ status: 200, message: '好友信息获取成功', data })
    }
    catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 更新好友备注
  async UpdateRemarks (req, res) {
    const { id, markname } = req.body
    try {
      const data = await Friend.findByIdAndUpdate(id, { markname })
      res.status(200).json({ status: 200, message: '好友备注修改成功' })
    }
    catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 拒绝好友或者同意好友
  async Refuse (req, res) {
    const { userID, friendID, status } = req.body
    try {
      let data = null
      if (status == 0) {
        data = await Friend.findOneAndDelete({
          $or: [
            { userID, friendID },
            {
              userID: friendID, friendID: userID
            }
          ]
        })
      } else {
        data = await Friend.findOneAndUpdate({
          $or: [
            { userID, friendID },
            {
              userID: friendID, friendID: userID
            }
          ]
        }, { status: 1 })
      }
      res.status(200).json({ status: 200, message: '好友状态修改成功' })
    }
    catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 发送消息
  async sendMessage (req, res) {
    const { sender_id, receiver_id, content, types } = req.body
    try {
      const data = await MsgSchema.create({ sender_id, receiver_id, content, types, tip: 0 })
      res.status(200).json({ status: 200, message: '消息发送成功' })
    }
    catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 获取消息
  async getMessage (req, res) {
    const { userID, friendID, page, limit } = req.body
    try {
      const skip = (page - 1) * limit
      const data = await MsgSchema.find({ $or: [{ sender_id: userID, receiver_id: friendID }, { sender_id: friendID, receiver_id: userID }] })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
      res.status(200).json({ status: 200, message: '消息获取成功' })
    }
    catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 修改好友表消息状态
  async updateMessage (req, res) {
    const { userID, friendID } = req.body
    try {
      const data = await MsgSchema.updateMany({ sender_id: friendID, receiver_id: userID, tip: 0 }, { tip: 1 })
      res.status(200).json({ status: 200, message: '消息状态修改成功', data })
    }
    catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }
}

module.exports = FriendInstance.friendController