const { messageService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

/**
 * GET ~/message/room-exist?recvId=:recvId
 * 상대방과 대화를 나눈 방 번호를 조회 또는 생성
 * @private
 */
const getRoomIdByUserId = async (req, res, next) => {
  try {
    const sendId = Number(req.user.id);
    const recvId = Number(req.query.recvId);

    // 수신자 id 빈 값 처리
    if (!recvId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER));
    }

    // 자기자신에게 보내기 금지
    if (sendId === recvId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.SELF_CHAT));
    }

    // 방 생성 or 가져오기
    const result = await messageService.getRoomIdByUserId(sendId, recvId);

    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('getRoomIdByUserId Controller 에러: \n' + error));
  }
};

/**
 * POST ~/message
 * 메시지 전송
 * @private
 */
const sendMessage = async (req, res, next) => {
  try {
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
  } catch (error) {
    return next(new Error('sendMessage Controller 에러: \n' + error));
  }
};

/**
 * GET ~/message
 * 유저가 최근에 받은 모든 쪽지 리스트 조회
 * @private
 */
const getAllMessageById = async (req, res, next) => {
  try {
    const result = await messageService.getAllMessageById(req.user.id);
    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('getAllMessageById Controller 에러: \n' + error));
  }
};

/**
 * GET ~/message/:roomId?curPage=&pageSize=
 * 톡방 메시지 읽어오기
 * @private
 */
const getAllMessageByRoomId = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const curPage = req.query.curPage || 1;
    const pageSize = req.query.pageSize || 5;

    let offset = (curPage - 1) * Number(pageSize);
    let limit = Number(pageSize);

    const userId = Number(req.user.id);

    if (!roomId) {
      return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    }

    const result = await messageService.getAllMessageByRoomId(roomId, userId, offset, limit);

    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('getAllMessageByRoomId Controller 에러: \n' + error));
  }
};

module.exports = {
  getRoomIdByUserId,
  sendMessage,
  getAllMessageById,
  getAllMessageByRoomId,
};
