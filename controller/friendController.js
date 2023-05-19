/* eslint-disable no-unused-vars */
const { Friend, MessageSchema, User } = require('../model/MongoTable')
const Message = require('../middleware/Message')
const userSocketMap = require('../utils/socket').userSocketMap
let url = require('url');
class FriendInstance {
  static friendController = new FriendInstance()
  // 添加好友
  async Addfriend (req, res) {
    try {
      const { userID, friendID, message } = req.body
      const data = await Friend.create({ userID, friendID, status: 0 })
      if (data) {
        const msg = await MessageSchema.create({ sender_id: userID, receiver_id: friendID, content: message, types: 0, status: 0 })
        await User.updateOne({ _id: userID }, { $push: { friendsID: friendID } });
        if (msg) {
          res.status(200).json({ status: 200, message: '好友申请已发送' })
        }
      }
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 删除好友
  async deleteFriend (req, res) {
    try {
      const { userID, friendID } = req.body;//获取请求体中的数据
      //从好友表中移除好友信息
      await Friend.deleteOne({ $or: [{ userID: userID, friendID: friendID }, { userID: friendID, friendID: userID }] });
      //从用户表中移除好友信息
      await User.updateOne({ _id: userID }, { $pull: { friendsID: friendID } });
      await User.updateOne({ _id: friendID }, { $pull: { friendsID: userID } });
      res.status(200).json({ status: 200, message: '删除成功' })
    } catch (err) {
      res.status(500).json({ status: 500, err, message: Message.SERVER_ERROR })
    }
  }

  // 拒绝好友或者同意好友
  async Refuse (req, res) {
    const { id, status } = req.body
    try {
      let data = null
      if (status == 0) {
        data = await Friend.findByIdAndDelete(id)
        await MessageSchema.findOneAndDelete({ $or: [{ sender_id: data.userID, receiver_id: data.friendID }, { sender_id: data.friendID, receiver_id: data.userID }], status: 0 })
        res.status(200).json({ status: 200, message: '已拒绝' })
      } else {
        data = await Friend.findByIdAndUpdate(id, { status: 1 })
        await MessageSchema.findOneAndUpdate({ $or: [{ sender_id: data.userID, receiver_id: data.friendID }, { sender_id: data.friendID, receiver_id: data.userID }], status: 0 }, { status: 1 }) // 修改消息状态
        res.status(200).json({ status: 200, message: '已同意' })
      }
    }
    catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }

  // 获取好友列表
  // async findFriends (req, res) {
  //   try {
  //     const { userID } = req.query
  //     let friends = await Friend.find({ $or: [{ userID: userID }, { friendID: userID }], status: 1 }, { status: 0, createTime: 0, updataTime: 0 }).populate('friendID', 'username profile sex explain').populate('userID', 'username profile sex explain') // Add this line to return plain JavaScript objects // 查询好友列表,状态为1的,即已经是好友的,并且是当前用户的好友,或者是当前用户添加的好友
  //     const friendList = friends.map(item => {
  //       if (item.userID._id == userID) {
  //         // const data = await getLastMessageAndUnreadCount(item.friendID._id, userID)
  //         // item.friendID.lastMessage = data.lastMessage
  //         // item.friendID.unreadCount = data.unreadCount
  //         return item.friendID
  //       } else {
  //         // const data = await getLastMessageAndUnreadCount(item.userID._id, userID)
  //         // item.userID.lastMessage = data.lastMessage
  //         // item.userID.unreadCount = data.unreadCount
  //         return item.userID
  //       }
  //     })
  //     // const friendListJSON = await Promise.all(friendList).then(data => data)
  //     res.status(200).json({ status: 200, message: '好友列表获取', data: friendList })
  //   } catch (error) {
  //     res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
  //   }
  // }

  async findFriends (req, res) {
    try {
      const { userID } = req.query;
      const friends = await Friend.find({ $or: [{ userID }, { friendID: userID }], status: 1 })
        .populate('friendID', 'username profile') // 添加 online 字段以获取好友在线状态
        .populate('userID', 'username profile') // 添加 online 字段以获取好友在线状态
        .exec();
      const friendList = [];
      for (const friend of friends) {
        let otherUser = friend.friendID;
        if (otherUser._id.equals(userID)) {
          otherUser = friend.userID;
        }

        // 获取最后一条消息和未读消息数量
        const { lastMessage, unreadCount } = await getLastMessageAndUnreadCount(otherUser._id, userID);

        // 添加在线状态字段
        otherUser = otherUser.toObject();
        otherUser.online = checkUserOnlineStatus(otherUser._id);

        // 组合返回结果
        friendList.push({
          user: otherUser,
          lastMessage,
          unreadCount,
        });
      }
      res.status(200).json({ status: 200, message: '好友列表获取', data: friendList });
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR });
    }
  }


  // 获取最新消息和未读消息数量
  async getLastMessageAndUnreadCount (req, res) {
    const { friendID, userID } = req.body
    try {
      const lastMessage = await MessageSchema.findOne({ $or: [{ sender_id: userID, receiver_id: friendID }, { sender_id: friendID, receiver_id: userID }] }, { sender_id: 1, content: 1, types: 1, time: 1 }).sort({ time: -1 }).limit(1)
      const unreadCount = await MessageSchema.countDocuments({ sender_id: friendID, receiver_id: userID, status: 0 }) // 只需要查询好友发给我的消息,并且状态为0的消息数量，因为我发给好友的消息，好友已经读取了，所以不需要查询，也不需要统计，所以这里的查询条件是sender_id:friendID,receiver_id:userID,status:0
      res.status(200).json({ status: 200, message: '获取成功', data: { lastMessage, unreadCount } })
    } catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }



  // 获取好友信息
  async getDetails (req, res) {
    const { id } = req.params
    try {
      const data = await User.findById(id, { role: 0, password: 0, createTime: 0, updataTime: 0, __v: 0, friendsID: 0, roleIds: 0, label: 0, code: 0 }).lean()
      const online = checkUserOnlineStatus(id)
      data.online = online
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



  // 发送消息
  async sendMessage (req, res) {
    const { sender_id, receiver_id, content, types } = req.body
    try {
      const data = await MessageSchema.create({ sender_id, receiver_id, content, types, status: 0, time: Date.now() })
      res.status(200).json({ status: 200, message: '消息发送成功' })
    }
    catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }



  // 获取消息的同时修改消息状态，同时得到每条消息的发送者信息
  // async getMessage (req, res) {
  //   try {
  //     const { sender_id, receiver_id, page, limit } = req.body
  //     const skip = (page - 1) * limit
  //     const data = await MessageSchema.find({
  //       $or: [{ $and: [{ sender_id: sender_id }, { receiver_id: receiver_id }] }, { $and: [{ sender_id: receiver_id }, { receiver_id: sender_id }] }]
  //     }).skip(skip)
  //       .limit(limit)
  //       .sort({ createdAt: -1 }).populate('sender_id', 'username profile').populate('receiver_id', 'username profile').lean();//查询指定两个人之间的消息列表，并将消息中的发送者和接收者信息一并查询出来
  //     let left = 0;
  //     let right = data.length - 1;
  //     while (left < right) {
  //       if (data[left].sender_id._id == sender_id) {
  //         delete data[left].sender_id;
  //         left++;
  //       } else {
  //         delete data[left].receiver_id;
  //       }
  //       if (data[right].sender_id._id == sender_id) {
  //         delete data[right].sender_id;
  //       } else {
  //         delete data[right].receiver_id;
  //         right--;
  //       }
  //     }
  //     if (left == right && data[left].sender_id._id == sender_id) {
  //       delete data[left].sender_id;
  //     } else if (left == right && data[left].receiver_id._id == sender_id) {
  //       delete data[left].receiver_id;
  //     }
  //     await MessageSchema.updateMany({ sender_id: receiver_id, receiver_id: sender_id, status: 0 }, { status: 1 }) // 将消息状态修改为已读，只修改接收者为当前用户的消息
  //     res.status(200).json({ status: 200, message: '消息获取成功', data })
  //   } catch (err) {
  //     res.status(500).json({ status: 500, err, message: Message.SERVER_ERROR })
  //   }
  // }
  async getMessage (req, res) {
    try {
      const { sender_id, receiver_id, page, limit } = req.body
      const skip = (page - 1) * limit

      const messages = await MessageSchema.find({
        $or: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id }
        ]
      }, { _id: 0, __v: 0, status: 0 })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({
          path: 'sender_id',
          select: 'username profile',
        })
        .populate({
          path: 'receiver_id',
          select: 'username profile',
        })
        .lean()
      messages.forEach((message) => {
        // 如果发送者是当前用户，就删除发送者信息,equals()方法用于判断两个字符串是否相等
        if (message.sender_id._id === sender_id.toString()) {
          delete message.sender_id
        } else {
          delete message.receiver_id
        }
      })
      const query = { sender_id: receiver_id, receiver_id: sender_id, status: 0 }
      await MessageSchema.updateMany(query, { status: 1 }, { multi: true })
      res.status(200).json({ status: 200, message: '消息获取成功', data: messages })
    } catch (err) {
      console.error(err)
      res.status(500).json({ status: 500, message: '服务器内部错误' })
    }
  }


  // 修改好友表消息状态
  async updateMessage (req, res) {
    const { userID, friendID } = req.body
    try {
      const data = await MessageSchema.updateMany({ sender_id: friendID, receiver_id: userID, status: 0 }, { status: 1 })
      res.status(200).json({ status: 200, message: '消息状态修改成功', data })
    }
    catch (error) {
      res.status(500).json({ status: 500, error, message: Message.SERVER_ERROR })
    }
  }


  /**
   * 图片上传
   */

  async upload (req, res) {
    console.log('req', req.file);
    const imageUrl = url.format({
      protocol: req.protocol,
      hostname: req.hostname,
      port: req.socket.localPort,
      pathname: req.file.path.replace(/^\/+/g, '')
    });
    // console.log(path.join(process.cwd(), req.file.path))
    try {
      // rename(`./public/${req.url}` + req.file.filename, `./public/${req.url}` + req.file.filename + format) //修改文件名
      res.status(200).json({ imageUrl, message: '上传成功' })
    } catch (err) {
      res.status(500).json({ error: err, message: Message.SERVER_ERROR })
    }
  }
}



// 获取最后一条消息和未读消息数
async function getLastMessageAndUnreadCount (userId, friendId) {
  try {
    // 查询最后一条消息
    const lastMessage = await MessageSchema.findOne({ $or: [{ sender_id: userId, receiver_id: friendId }, { sender_id: friendId, receiver_id: userId }] }, { sender_id: 1, content: 1, types: 1, time: 1 }).sort({ time: -1 }).limit(1)
    // 查询未读消息数
    const unreadCount = await MessageSchema.countDocuments({ sender_id: friendId, receiver_id: userId, status: 0 })
    return {
      lastMessage: lastMessage || {},
      unreadCount
    }
  } catch (error) {
    console.log(error)
  }
}

// 检查用户在线状态
function checkUserOnlineStatus (userId) {
  const ws = userSocketMap.get(userId.toString())
  if (ws) {
    return ws.readyState == 1 // 0 - CONNECTING, 1 - OPEN, 2 - CLOSING, 3 - CLOSED，如果是OPEN状态则表示用户在线，否则不在线，返回false，表示用户不在线
  }
  return false
}
module.exports = FriendInstance.friendController
