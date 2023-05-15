const WebSocket = require('ws');
const { MessageSchema } = require('../model/MongoTable')
const wss = new WebSocket.Server({
  port: 8081
});
const userSocketMap = new Map();
const wsModule = {
  wss: wss,
  userSocketMap: userSocketMap
};


wss.on('connection', function (socket, request) {
  let userId = ''
  console.log('Client connected.request', request.url);
  console.log(wss.clients.size);
  socket.on('message', function (message) {
    try {
      let data = JSON.parse(message);
      if (data?.type === 'register') {
        // 如果是注册消息，则将该用户 ID 与 WebSocket 实例进行绑定
        userId = data?.userId;
        // 保存用户 ID 和对应的 WebSocket 实例的映射
        userSocketMap.set(userId, socket);

      } else if (data?.type === 'private') {
        // 如果是一对一聊天，则将消息发送给指定用户
        const receiverId = data.receiver_id;
        const senderId = data.user_id;
        // 1. 保存消息到数据库
        sendMessage({ sender_id: senderId, receiver_id: receiverId, content: data.content, types: '0' })
        // 2. 将消息发送给指定用户
        const receiverSocket = userSocketMap.get(receiverId);
        if (receiverSocket) {
          receiverSocket.send(JSON.stringify({
            ...data
          }));
        } else {
          console.log(`User ${receiverId} is not online.`);
        }
        // 3. 将消息发送给自己
        const senderSocket = userSocketMap.get(senderId);
        if (senderSocket) {
          senderSocket.send(JSON.stringify({
            ...data
          }));
        } else {
          console.log(`User ${senderId} is not online.`);
        }


      } else if (data?.type === 'group') {
        // 如果是群聊，则将消息发送给所有在线用户
        // wss.clients.forEach(client => {
        //   if (client.readyState === socket.OPEN) {
        //     client.send(JSON.stringify({
        //       senderId: userId,
        //       type: 'group',
        //       content: data.content
        //     }));
        //   }
        // });
        // 优化：不用遍历所有的客户端，只需要遍历群聊的客户端
        const groupId = data.group_id;
        wss.clients.forEach(client => {
          if (client.readyState === socket.OPEN) {
            // 判断该客户端是否在群聊中
            if (client.groupId === groupId) {
              client.send(JSON.stringify({
                ...data
              }));
            }
          }
        });
      } else {
        socket.send(JSON.stringify(data));
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('close', () => {
    // 从映射表中删除该用户的 WebSocket 连接
    userSocketMap.delete(userId);
  });
});


async function sendMessage (req) {
  const { sender_id, receiver_id, content, types } = req
  try {
    await MessageSchema.create({ sender_id, receiver_id, content, types, status: 0, time: Date.now() })
    console.log('成功');
  }
  catch (err) {
    console.log(err);
  }
}

module.exports = wsModule;