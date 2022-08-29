/*
process.env를 모든 파일에서 사용하지말고, 이 파일에 정의해두고 사용하기

기존:
require('dotenv').config();
const PORT = process.env.PORT

권장:
const config = require('./config');
const PORT = config.PORT

*/

require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10),
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  slackURI: process.env.SLACK_URI,
};
