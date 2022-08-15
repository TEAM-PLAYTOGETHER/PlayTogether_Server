const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const hpp = require('hpp');
const Http = require('http');
const helmet = require('helmet');
const passportConfig = require('./passport');
const passport = require('passport');
const session = require('express-session');
const statusCode = require('./constants/statusCode');
const util = require('./lib/util');
const responseMessage = require('./constants/responseMessage');

// const sentry = require('@sentry/node');
// const tracing = require('@sentry/tracing');

// const slackBot = require('../utils/slackBot');
dotenv.config();

const app = express();
const http = Http.createServer(app);

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

app.use('*', (req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: '존재하지 않는 경로입니다.',
  });
});

/*
app.use(sentry.Handlers.errorHandler());
*/

app.use(function (err, req, res, next) {
  console.log('에러는 이 곳에서 처리');
  console.log(err);
  return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));

  // 슬랙봇 연결하기
  /*
  slackBot
    .send(
      'api-서버-로그',
      `오류가 발생했습니다 !\n
        \`Error Message\`: ${err.message}\n`,
    )
    .then();

  res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, err.message));
  */
});

module.exports = http;