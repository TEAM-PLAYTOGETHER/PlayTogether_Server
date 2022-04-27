const { messageService } = require('../service');

const db = require('../loaders/db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const sendMessage = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);

    const sendId = 3; // TODO: 미들웨어 추가해서 req.user.id로 가져오는 것으로 변경
    const { recvId, content } = req.body;

    // 수신자 id 빈 값 처리
    if (!recvId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    }

    // 메시지 빈 값 처리
    if (!content) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_MESSAGE));
    }

    // 자기자신에게 보내기 금지
    if (sendId === recvId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.MESSAGE_SEND_FAIL));
    }

    // 메시지 전송
    const serviceReturn = await messageService.sendMessage(client, sendId, recvId, content);

    // serviceReturn의 데이터가 없다면, 실패 반환
    if (serviceReturn.data === null) {
      return res.status(serviceReturn.statusCode).json(util.fail(serviceReturn.statusCode, serviceReturn.message));
    }

    // 성공
    return res.status(statusCode.OK).json(util.success(serviceReturn.statusCode, serviceReturn.message, serviceReturn.data));
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

const getAllMessageById = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);

    const result = await messageService.getAllMessageById(client, req.user.id);
    return res.status(statusCode.OK).json(result);
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

module.exports = {
  sendMessage,
  getAllMessageById,
};
