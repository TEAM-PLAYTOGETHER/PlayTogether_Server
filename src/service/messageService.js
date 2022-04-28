const { messageDao } = require('../db');

const { serviceReturn } = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const util = require('../lib/util');

const sendMessage = async (client, sendId, recvId, content) => {
  try {
    // TODO: recvId - userDao 생기면 실제로 존재하는 유저인지 검사
    /*
    const exist = await userDao.exist(recvId);
    if (!exist) {
      return serviceReturn(존재X 유저)
    }
    */

    // Dao에서 Room 가져오기 (getRoom(senderId, receiverId) : roomId)
    let roomExist = await messageDao.getRoom(client, sendId, recvId);

    // 만약 room이 없다면 생성
    if (!roomExist) {
      roomExist = await messageDao.createRoom(client, sendId, recvId);
    }

    const roomId = roomExist.id;

    // messageDao에서 message 보내기
    const cnt = await messageDao.sendMessage(client, roomId, sendId, recvId, content);

    // insert 쿼리의 결과가 1이 아니라면 에러 처리
    if (cnt !== 1) {
      return serviceReturn(statusCode.INTERNAL_SERVER_ERROR, responseMessage.MESSAGE_SEND_FAIL);
    }

    // 성공
    return serviceReturn(statusCode.OK, responseMessage.MESSAGE_SEND_SUCCESS, { roomId });
  } catch (error) {
    console.log('Service에서 error 발생: ' + error);
    return serviceReturn(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

const getAllMessageById = async (client, userId) => {
  try {
    const rowMessages = await messageDao.getAllMessageById(client, userId);

    const messages = rowMessages.map((rowMessage) => {
      let message = {
        roomId: rowMessage.roomId,
        audience: rowMessage.audience,
        audienceId: rowMessage.audienceId,
        send: Number(rowMessage.sendId) === Number(userId) ? true : false,
        createdAt: rowMessage.createdAt,
        content: rowMessage.content,
      };
      return message;
    });

    return util.success(statusCode.OK, responseMessage.MESSAGE_READ_SUCCESS, { messages });
  } catch (error) {
    console.log('Service에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

const getAllMessageByRoomId = async (client, roomId, userId) => {
  try {
    const rowMessages = await messageDao.getAllMessageByRoomId(client, roomId);

    const messages = rowMessages.map((rowMessage) => {
      let message = {
        messageId: rowMessage.id,
        send: Number(rowMessage.sendId) === Number(userId) ? true : false,
        createdAt: rowMessage.createdAt,
        content: rowMessage.content,
      };
      return message;
    });

    return util.success(statusCode.OK, responseMessage.MESSAGE_READ_SUCCESS, { messages });
  } catch (error) {
    console.log('Service에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  sendMessage,
  getAllMessageById,
  getAllMessageByRoomId,
};
