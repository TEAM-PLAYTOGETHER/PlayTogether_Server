const axios = require('axios');
const { error } = require('console');
const config = require('../config');

const slackURI = config.slackURI;

const sendMessageToSlack = (message) => {
  // 슬랙 Webhook을 이용해 슬랙에 메시지를 보내는 코드
  try {
    axios
      .post(slackURI, { text: message })
      .then((response) => {})
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    console.error(e);
    // 슬랙 Webhook 자체에서 에러가 났을 경우,
    // 콘솔에 에러를 찍는 코드
  }
};

const slackWebhook = (req, message) => {
  const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}\n${message} ${JSON.stringify(error)}`;
  sendMessageToSlack(slackMessage);
};

module.exports = slackWebhook;
