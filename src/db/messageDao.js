const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

/**
 * getRoom
 * sendId와 recvId가 주고 받은 채팅방 정보를 가져오는 메서드
 * @param {*} sendId - 전송자 id값
 * @param {*} recvId - 수신자 id값
 * @returns 채팅방 정보
 */
const getRoom = async (client, sendId, recvId) => {
  try {
    const { rows } = await client.query(
      `
          select id
          from room
          where (member_one_id = $1 and member_two_id = $2)
          or (member_one_id = $2 and member_two_id = $1)
          `,
      [sendId, recvId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('messageDao.getRoom에서 오류 발생: ' + error);
  }
};

/**
 * getRoomByRoomId
 * roomId로 채팅창 정보를 가져오는 메서드
 * @param {*} roomId - 채팅방 id값
 * @returns 채팅방 정보
 */
const getRoomByRoomId = async (client, roomId) => {
  try {
    const { rows } = await client.query(
      `
      select member_one_id, member_two_id
      from room
      where id = $1
      `,
      [roomId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('messageDao.getRoom에서 오류 발생: ' + error);
  }
};

/**
 * createRoom
 * 채팅방을 생성하는 메서드
 * @param {*} sendId - 참여자1 id값
 * @param {*} recvId - 참여자2 id값
 * @returns 생성된 방의 id값
 */
const createRoom = async (client, sendId, recvId) => {
  try {
    const { rows } = await client.query(
      `
          insert into room (member_one_id, member_two_id)
          values ($1, $2)
          returning id
          `,
      [sendId, recvId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('messageDao.createRoom에서 오류 발생: ' + error);
  }
};

/**
 * sendMessage
 * 발신자가 수신자에게 메시지를 전송하는 메서드
 * @param {*} roomId - 채팅방 id값
 * @param {*} sendId - 발신자 id값
 * @param {*} recvId - 수신자 id값
 * @param {*} content - 메시지 내용
 * @returns 전송에 성공한 메시지의 수
 */
const sendMessage = async (client, roomId, sendId, recvId, content) => {
  try {
    const { rowCount } = await client.query(
      `
          insert into message (content, room_id, send_id, recv_id)
          values ($1, $2, $3, $4)
          `,
      [content, roomId, sendId, recvId],
    );
    return rowCount;
  } catch (error) {
    throw new Error('messageDao.sendMessage에서 오류 발생: ' + error);
  }
};

/**
 * getAllMessageById
 * 사용자가 받은 모든 메시지 중 채팅방 별로 최근에 받은 메시지 하나를 반환하는 메서드
 * @param {*} userId - 사용자의 id값
 * @returns - 메시지 모음
 */
const getAllMessageById = async (client, userId) => {
  try {
    const { rows } = await client.query(
      `
          select room_id,
                send_id,
                m.created_at,
                content,
                read,
                case
                    when send_id = $1 then receiver.name
                    else sender.name
                    end as audience,
                case
                    when send_id = $1 then recv_id
                    else send_id
                    end as audience_id
          from message m
                  left join "user" sender
                            on m.send_id = sender.id
                  left join "user" receiver
                            on m.recv_id = receiver.id
          where m.id in (
              select id
              from (
                      select id, rank() over (partition by room_id order by created_at desc, id desc) as rn
                      from message
                      where room_id in (select id from room where member_one_id = $1 or member_two_id = $1)
                  ) as ranking
              where ranking.rn = 1)
          order by created_at desc;
      `,
      [userId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('messageDao.getAllMessageById에서 오류 발생: ' + error);
  }
};

/**
 * getAllMessageByRoomId
 * roomId에 해당하는 채팅방의 모든 채팅을 가져오는 메서드
 * @param {*} roomId - 채팅방 id값
 * @returns - 해당 채팅방의 모든 메시지
 */
const getAllMessageByRoomId = async (client, roomId) => {
  try {
    const { rows } = await client.query(
      `
      select m.id, m.created_at, m.content, m.send_id, m.read
      from room r
               left join message m
                         on r.id = m.room_id
      where r.id = $1
      order by created_at;
      `,
      [roomId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('messageDao.getAllMessageByRoomId에서 오류 발생: ' + error);
  }
};

/**
 * readAllMessage
 * userId와 roomId를 받아 자신에게 온 모든 메시지를 읽음처리하는 메서드
 * @param {*} roomId - 채팅방 id값
 * @param {*} userId - 회원 id값
 * @returns 읽음 처리한 메시지의 수
 */
const readAllMessage = async (client, roomId, userId) => {
  try {
    const { rowCount } = await client.query(
      `
      update message
      set read = true
      where room_id = $1 and recv_id = $2
      `,
      [roomId, userId],
    );
    return rowCount;
  } catch (error) {
    throw new Error('messageDao.readAllMessage에서 오류 발생: ' + error);
  }
};

module.exports = {
  getRoom,
  getRoomByRoomId,
  createRoom,
  sendMessage,
  getAllMessageById,
  getAllMessageByRoomId,
  readAllMessage,
};
