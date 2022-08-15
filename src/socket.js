const { Server } = require('socket.io');
const http = require('./app');
const io = new Server(http);

console.log('hi');

io.on('connection', (socket) => {
  // 클라가 io 서버 접속시 고유 id를 얻음
  console.log(`Connection : SocketId = ${socket.id}`);

  // 1. 헤더 확인 -> 서버 연결 필요
  const jwt = socket.handshake.headers.authorization;

  // 2. 방 번호 확인
  let roomId;
  let audienceId;

  socket.on('subscribe', (data) => {
    const parsedData = JSON.parse(data);
    roomId = parsedData.roomId;
    audienceId = parsedData.audienceId;

    socket.join(roomId);
    console.log(`${socket.id}님이 ${roomId}에 접속: 대화상대 = ${audienceId}`);
  });

  socket.on('sendMessage', async (data) => {
    const parsedData = JSON.parse(data);
    const chatData = {
      recvId: audienceId,
      content: parsedData.messageContent,
    };

    console.log(chatData);

    socket.broadcast.to(roomId).emit('newMessage', JSON.stringify(chatData));

    // DB에 메시지 저장
    try {
      console.log(data);
    } catch (error) {
      console.log(error);
    }

    // 푸시알림 이벤트 트리거
  });

  socket.on('disconnect', () => {
    socket.leave(roomId);
    console.log('disconnect 합니다.');
  });
});
