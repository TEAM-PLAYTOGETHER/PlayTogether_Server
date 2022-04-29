const { messageService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const sendMessage = async (req, res) => {
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
  const result = await messageService.sendMessage(sendId, recvId, content);

  return res.status(result.status).json(result);
};

const getAllMessageById = async (req, res) => {
  const result = await messageService.getAllMessageById(req.user.id);
  return res.status(result.status).json(result);
};

const getAllMessageByRoomId = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  const result = await messageService.getAllMessageByRoomId(roomId, userId);

  return res.status(result.status).json(result);
};

module.exports = {
  sendMessage,
  getAllMessageById,
  getAllMessageByRoomId,
};
