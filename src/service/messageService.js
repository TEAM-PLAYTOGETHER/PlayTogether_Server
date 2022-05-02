const { messageDao, testDao, userDao } = require('../db');

const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const util = require('../lib/util');

const sendMessage = async (sendId, recvId, content) => {
  try {
    // recvId가 존재하는 유저인지 검사
    const exist = await userDao.getUserById(recvId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }

    // Dao에서 Room 가져오기 (getRoom(senderId, receiverId) : roomId)
    let roomExist = await messageDao.getRoom(sendId, recvId);
    if (roomExist === null) throw new Error();

    // 만약 room이 없다면 생성
    if (!roomExist) {
      roomExist = await messageDao.createRoom(sendId, recvId);
    }
    if (roomExist === null) throw new Error();

    const roomId = roomExist.id;

    // messageDao에서 message 보내기
    const cnt = await messageDao.sendMessage(roomId, sendId, recvId, content);
    if (cnt === null) throw new Error();

    // insert 쿼리의 결과가 1이 아니라면 에러 처리
    if (cnt !== 1) {
      return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.MESSAGE_SEND_FAIL);
    }

    // 성공
    return util.success(statusCode.OK, responseMessage.MESSAGE_SEND_SUCCESS, { roomId });
  } catch (error) {
    console.log('sendMessage에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

const getAllMessageById = async (userId) => {
  try {
    const rowMessages = await messageDao.getAllMessageById(userId);
    if (rowMessages === null) throw new Error();

    const messages = rowMessages.map((rowMessage) => {
      let message = {
        roomId: rowMessage.roomId,
        audience: rowMessage.audience,
        audienceId: rowMessage.audienceId,
        send: Number(rowMessage.sendId) === Number(userId),
        read: Number(rowMessage.sendId) === Number(userId) ? true : rowMessage.read && true,
        createdAt: rowMessage.createdAt,
        content: rowMessage.content,
      };
      return message;
    });

    return util.success(statusCode.OK, responseMessage.MESSAGE_READ_SUCCESS, { messages });
  } catch (error) {
    console.log('getAllMessageById에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

const getAllMessageByRoomId = async (roomId, userId) => {
  try {
    const cnt = await messageDao.readAllMessage(roomId, userId);
    if (cnt === null) throw new Error();

    const rowMessages = await messageDao.getAllMessageByRoomId(roomId);
    if (rowMessages === null) throw new Error();

    const messages = rowMessages.map((rowMessage) => {
      let message = {
        messageId: rowMessage.id,
        send: Number(rowMessage.sendId) === Number(userId),
        read: Number(rowMessage.sendId) === Number(userId) ? true : rowMessage.read && true,
        createdAt: rowMessage.createdAt,
        content: rowMessage.content,
      };
      return message;
    });

    return util.success(statusCode.OK, responseMessage.MESSAGE_READ_SUCCESS, { messages });
  } catch (error) {
    console.log('getAllMessageByRoomId에서 error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  sendMessage,
  getAllMessageById,
  getAllMessageByRoomId,
};
