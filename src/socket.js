const { Server } = require('socket.io');
const http = require('./app');
const util = require('./lib/util');
const jwtUtil = require('./lib/jwtUtil');
const { userService } = require('./service');
const { sendMessage, readAllMessageByRoomId } = require('./service/messageService');
const io = new Server(http);

io.on('connection', async (socket) => {
  let myId;
  let uMyId;
  let myData;

  try {
    console.log(`Connection : SocketId = ${socket.id}`);

    const token = socket.handshake.headers.authorization;
    const decoded = jwtUtil.verify(token);
    if (decoded === 'jwt expired' || decoded === 'jwt invalid') {
      throw new Error('만료되거나 검증되지 않은 토큰');
    }
    myId = decoded.id;
    if (!myId) {
      throw new Error('확인할 수 없는 유저');
    }

    const myDataResponse = await userService.getUserById(myId);
    if (myDataResponse.success === false) {
      throw new Error('사용자(본인) 정보 조회 실패');
    }
    myData = myDataResponse.data;

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
  let roomId;

  socket.on('reqEnterRoom', (data) => {
    try {
      const { recvId } = JSON.parse(data);
      roomId = JSON.parse(data).roomId;

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

      const sendMessageResponse = await sendMessage(myId, recvId, content);
      if (sendMessageResponse.success === false) {
        throw new Error(sendMessageResponse.message);
      }

      const emitMessage = {
        roomId,
        audience: myData.name,
        audienceId: Number(myData.id),
        audienceProfile: myData.picture === 'picture' ? null : myData.picture,
        content: sendMessageResponse.data.message.content,
        createdAt: sendMessageResponse.data.message.createdAt,
      };
      socket.broadcast.to(uid).emit('newMessageToUser', util.success(200, 'newMessageToUser 성공', { message: emitMessage }));
      socket.broadcast.to(rid).emit('newMessageToRoom', util.success(200, 'newMessageToRoom 성공', { message: emitMessage }));

      io.to(socket.id).emit('resSendMessage', util.success(200, 'sendMessage 성공', sendMessageResponse.data));
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit('resSendMessage', util.fail(500, 'sendMessage 실패'));
    }
  });

  socket.on('reqExitRoom', async () => {
    try {
      socket.leave(uid);
      socket.leave(rid);
      uid = null;
      rid = null;

      await readAllMessageByRoomId(roomId, myId);

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
