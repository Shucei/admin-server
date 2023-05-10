
module.exports = function (wss) {
  // 内存中的映射表
  const userSocketMap = {};
  wss.on('connection', function (socket, request) {
    let userId = ''
    console.log('Client connected.request', request.url);
    console.log(wss.clients.size);
    socket.on('message', function (message) {
      try {
        let data = JSON.parse(message);
        console.log('data', data);
        if (data?.type === 'register') {
          // 如果是注册消息，则将该用户 ID 与 WebSocket 实例进行绑定
          userId = data?.userId;
          // 保存用户 ID 和对应的 WebSocket 实例的映射
          userSocketMap[userId] = socket;
          socket.send('服务器返回：' + JSON.stringify(data));
        } else if (data?.type === 'private') {
          // 如果是一对一聊天，则将消息发送给指定用户
          const receiverId = data.receiverId;
          const receiverSocket = userSocketMap[receiverId];
          if (receiverSocket) {
            receiverSocket.send(JSON.stringify({
              senderId: userId,
              type: 'private',
              content: data.content
            }));
          } else {
            console.log(`User ${receiverId} is not online.`);
          }
        } else if (data?.type === 'group') {
          // 如果是群聊，则将消息发送给所有在线用户
          wss.clients.forEach(client => {
            if (client.readyState === socket.OPEN) {
              client.send(JSON.stringify({
                senderId: userId,
                type: 'group',
                content: data.content
              }));
            }
          });
        } else {
          socket.send('服务器返回：' + JSON.stringify(data));
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('close', () => {
      // 从映射表中删除该用户的 WebSocket 连接
      delete userSocketMap[userId];
    });
  });
};

