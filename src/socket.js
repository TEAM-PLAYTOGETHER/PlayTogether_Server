const { Server } = require('socket.io');
const http = require('./app');
const util = require('./lib/util');
const { getUserIdByToken } = require('./middlewares/jwtAuthorization');
const { sendMessage } = require('./service/messageService');
const io = new Server(http);

io.on('connection', (socket) => {
  let myId;
  let uMyId;

  try {
    console.log(`Connection : SocketId = ${socket.id}`);

    const token = socket.handshake.headers.authorization;
    myId = getUserIdByToken(token);
    if (!myId) {
      throw new Error('user 토큰 만료 or 잘못된 토큰');
    }

    uMyId = 'u' + String(myId);

    socket.join(uMyId);
    console.log(uMyId);
    io.to(socket.id).emit('resConnection', util.success(200, 'connection 성공', socket.id));
  } catch (e) {
    console.log(e);
    io.to(socket.id).emit('resConnection', util.fail(500, 'connection 실패'));
  }

  let uid;
  let rid;

  socket.on('reqEnterRoom', (data) => {
    try {
      const { recvId, roomId } = JSON.parse(data);

      uid = 'u' + String(recvId);
      rid = 'r' + String(roomId);

      socket.join(uid);
      socket.join(rid);
      console.log(`uid: ${uid}, rid: ${rid}`);

      io.to(socket.id).emit('resEnterRoom', util.success(200, 'enterRoom 성공', { uid, rid }));
    } catch (e) {
      console.log(e);
      io.to(socket.id).emit('resEnterRoom', util.fail(500, 'enterRoom 실패'));
    }
  });

  socket.on('reqSendMessage', async (test) => {
    try {
      const { recvId, content } = JSON.parse(test);
      const chatData = {
        recvId,
        content,
      };

      sendMessage(myId, recvId, content);

      socket.broadcast.to(uid).emit('newMessageToUser', JSON.stringify(chatData));
      socket.broadcast.to(rid).emit('newMessageToRoom', JSON.stringify(chatData));

      io.to(socket.id).emit('resSendMessage', util.success(200, 'sendMessage 성공', chatData));
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit('resSendMessage', util.fail(500, 'sendMessage 실패'));
    }
    // 푸시알림 이벤트 트리거
  });

  socket.on('reqExitRoom', () => {
    try {
      socket.leave(uid);
      socket.leave(rid);
      uid = null;
      rid = null;

      io.to(socket.id).emit('resExitRoom', util.success(200, 'exitRoom 성공'));
    } catch (e) {
      console.log(e);
      io.to(socket.id).emit('resExitRoom', util.fail(500, 'exitRoom 실패'));
    }
  });

  socket.on('disconnect', () => {
    socket.leave(uMyId);
    console.log('disconnect 합니다.');
  });
});
