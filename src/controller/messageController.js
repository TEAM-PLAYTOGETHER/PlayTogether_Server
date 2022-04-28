const { messageService } = require('../service');

const db = require('../loaders/db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const sendMessage = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);

    const sendId = req.user.id;
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
    const result = await messageService.sendMessage(client, sendId, recvId, content);

    return res.status(result.status).json(result);
  } catch (error) {
    console.log('Controller에서 error 발생: ', error);
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
    return res.status(result.status).json(result);
  } catch (error) {
    console.log('Controller에서 error 발생: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

const getAllMessageByRoomId = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);

    const { roomId } = req.params;
    const userId = req.user.id;

    const result = await messageService.getAllMessageByRoomId(client, roomId, userId);

    return res.status(result.status).json(result);
  } catch (error) {
    console.log('Controller에서 error 발생: ', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

module.exports = {
  sendMessage,
  getAllMessageById,
  getAllMessageByRoomId,
};
