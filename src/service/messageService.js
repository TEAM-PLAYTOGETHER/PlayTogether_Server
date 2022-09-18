const db = require('../loaders/db');
const { messageDao, userDao, blockUserDao } = require('../db');
const admin = require('firebase-admin');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const util = require('../lib/util');
const { applyKoreanTime } = require('../lib/applyKoreanTime');

/**
 * getRoomIdByUserId
 * 상대방과 대화를 나눈 방 번호를 조회 또는 생성해서 반환해주는 서비스
 * @param {*} sendId - 유저의 id값
 * @param {*} recvId - 대화 상대방 id값
 * @returns - 기존에 나눈 대화방 번호 or 새롭게 생성된 대화방 번호
 */
const getRoomIdByUserId = async (sendId, recvId) => {
  let client;
  const log = `messageService.getRoomIdByUserId | sendId = ${sendId}, recvId = ${recvId}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // recvId가 존재하는 유저인지 검사
    const exist = await userDao.getUserById(client, recvId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }

    // Dao에서 Room 가져오기
    let roomExist = await messageDao.getRoom(client, sendId, recvId);

    // 만약 room이 없다면 생성
    if (!roomExist) {
      roomExist = await messageDao.createRoom(client, sendId, recvId);
    }

    // messageDao에서 message 보내기
    const roomId = roomExist.id;

    // 성공
    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.ROOM_SUCCESS, { roomId });
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('messageService getRoomIdByUserId에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

/**
 * sendMessage
 * 발신자가 수신자에게 메시지를 전송하는 서비스
 * @param {*} sendId - 발신자 id값
 * @param {*} recvId - 수신자 id값
 * @param {*} content - 메시지 내용
 * @returns
 */
const sendMessage = async (sendId, recvId, content) => {
  let client;
  const log = `messageService.sendMessage | sendId = ${sendId}, recvId = ${recvId}, content = ${content}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // recvId가 존재하는 유저인지 검사

    const exist = await userDao.getUserById(client, recvId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }

    // Dao에서 Room 가져오기
    let roomExist = await messageDao.getRoom(client, sendId, recvId);

    // 만약 room이 없다면 생성
    if (!roomExist) {
      roomExist = await messageDao.createRoom(client, sendId, recvId);
    }

    // 차단 유저면 메시지 전송 실패
    const getSendBlockUser = await blockUserDao.getBlockUsers(client, sendId, recvId);
    const getReceiveBlockUser = await blockUserDao.getBlockUsers(client, recvId, sendId);
    if (getSendBlockUser || getReceiveBlockUser) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }

    // messageDao에서 message 보내기
    const roomId = roomExist.id;
    const resSendMessage = await messageDao.sendMessage(client, roomId, sendId, recvId, content);

    // insert 쿼리의 결과가 1이 아니라면 에러 처리
    if (resSendMessage.rowCount !== 1) {
      return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.MESSAGE_SEND_FAIL);
    }

    // 방금 전송한 메시지의 id를 통해 response로 넘길 데이터 가져옴
    const sendedMessageId = resSendMessage.rows[0].id;
    const messageData = await messageDao.getMessageByMessageId(client, sendedMessageId);

    const sendedMessage = messageData.map((rowMessage) => {
      let message = {
        messageId: Number(rowMessage.id),
        send: true,
        read: false,
        createdAt: applyKoreanTime(rowMessage.createdAt),
        content: rowMessage.content,
      };
      return message;
    });

    const recvUser = await userDao.getUserById(client, recvId);
    const sendUser = await userDao.getUserById(client, sendId);

    if (recvUser.deviceToken) {
      // 푸시알림 정보
      const body = `${content}`;
      const message = {
        notification: {
          title: `${sendUser.name}`,
          body: body,
        },
        token: recvUser.deviceToken,
        roomId: roomId,
      };

      admin
        .messaging()
        .send(message)
        .catch(function (error) {
          console.log('messageService sendMessage push notification error 발생: \n' + error);
        });
    }

    // 성공
    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.MESSAGE_SEND_SUCCESS, { message: sendedMessage[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('messageService sendMessage에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

/**
 * getAllMessageById
 * 유저가 받은 모든 메시지 중 채팅방 별로 가장 최근의 메시지들만 모아주는 서비스
 * @param {*} userId - 유저 id값
 * @returns - 최근에 받은 모든 메시지들
 */
const getAllMessageById = async (userId) => {
  let client;
  const log = `messageService.getAllMessageById | userId = ${userId}`;

  try {
    client = await db.connect(log);

    // 메시지들을 가져옴
    const rowMessages = await messageDao.getAllMessageById(client, userId);

    // 가져온 메시지들을 용도에 맞게 매핑
    const messages = rowMessages.map((rowMessage) => {
      let message = {
        roomId: Number(rowMessage.roomId),
        audience: rowMessage.audience,
        audienceId: Number(rowMessage.audienceId),
        audienceProfile: rowMessage.profile === 'picture' ? null : rowMessage.profile,
        send: Number(rowMessage.sendId) === Number(userId),
        read: Number(rowMessage.sendId) === Number(userId) ? true : rowMessage.read && true,
        createdAt: applyKoreanTime(rowMessage.createdAt),
        content: rowMessage.content,
      };
      return message;
    });

    return util.success(statusCode.OK, responseMessage.MESSAGE_READ_SUCCESS, { messages });
  } catch (error) {
    throw new Error('messageService getAllMessageById에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

/**
 * getAllMessageByRoomId
 * 채팅방의 모든 메시지를 가져오는 서비스
 * @param {*} roomId - 채팅방 id값
 * @param {*} userId - 유저 id값
 * @returns 모든 메시지
 */
const getAllMessageByRoomId = async (roomId, userId) => {
  let client;
  const log = `messageService.getAllMessageByRoomId | roomId = ${roomId}, userId = ${userId}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 방이 존재하는지 확인
    const existRoom = await messageDao.getRoomByRoomId(client, roomId);
    if (!existRoom) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_ROOM);
    }

    // 유저가 해당 채팅방에 접근권한이 있는지 확인
    if (Number(existRoom.memberOneId) !== userId && Number(existRoom.memberTwoId) !== userId) {
      return util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_AUTHENTICATED);
    }

    // 채팅방의 메시지를 가져오기 전에, 상대방이 보낸 모든 메시지 읽음처리
    await messageDao.readAllMessage(client, roomId, userId);

    // 채팅방의 메시지를 가져옴
    const rowMessages = await messageDao.getAllMessageByRoomId(client, roomId);

    // 가져온 메시지를 용도에 맞게 매핑
    const messages = rowMessages.map((rowMessage) => {
      let message = {
        messageId: Number(rowMessage.id),
        send: Number(rowMessage.sendId) === Number(userId),
        read: rowMessage.read,
        createdAt: applyKoreanTime(rowMessage.createdAt),
        content: rowMessage.content,
      };
      return message;
    });

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.MESSAGE_READ_SUCCESS, { messages });
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('messageService getAllMessageByRoomId에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

module.exports = {
  getRoomIdByUserId,
  sendMessage,
  getAllMessageById,
  getAllMessageByRoomId,
};
