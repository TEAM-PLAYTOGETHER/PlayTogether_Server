const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const hpp = require('hpp');
const helmet = require('helmet');
const config = require('./config');
const passportConfig = require('./passport');
const passport = require('passport');
const session = require('express-session');
const redis = require('redis');
const { Server } = require('socket.io');
const { messageService } = require('./service');
const { messageController } = require('./controller');

// const sentry = require('@sentry/node');
// const tracing = require('@sentry/tracing');

// const slackBot = require('../utils/slackBot');
dotenv.config();

const app = express();
passportConfig();
app.use(cors());

/*
sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new sentry.Integrations.Http({ tracing: true }), new tracing.Integrations.Express({ app })],
  tracesSampleRate: 1.0,
});

app.use(sentry.Handlers.requestHandler());
app.use(sentry.Handlers.tracingHandler());
*/

if (process.env.NODE_ENV === 'production') {
  app.use(hpp());
  app.use(helmet());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', require('./routes'));

/*
app.use(sentry.Handlers.errorHandler());

app.use(function onError(err, req, res, next) {
  slackBot
    .send(
      'api-서버-로그',
      `오류가 발생했습니다 !\n
        \`Error Message\`: ${err.message}\n`,
    )
    .then();

  res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, err.message));
});
*/

app.use('*', (req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: '존재하지 않는 경로입니다.',
  });
});

const PORT = config.port;
const server = app
  .listen(PORT, () => {
    console.log(
      `
    
    ##############################################
    🛡️  Server listening on port: ${PORT} 🛡️
    ⚡️ Updated: 22.07.27              ⚡️
    ##############################################
  `,
    );
  })
  .on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

const io = new Server(server);
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

server.timeout = 1000000;
