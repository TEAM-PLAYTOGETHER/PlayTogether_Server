const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRoom = async (client, sendId, recvId) => {
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
};

const createRoom = async (client, sendId, recvId) => {
  const { rows } = await client.query(
    `
        insert into room (member_one_id, member_two_id)
        values ($1, $2)
        returning id
        `,
    [sendId, recvId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const sendMessage = async (client, roomId, sendId, recvId, content) => {
  const { rowCount } = await client.query(
    `
        insert into message (content, room_id, send_id, recv_id)
        values ($1, $2, $3, $4)
        `,
    [content, roomId, sendId, recvId],
  );
  return rowCount;
};

module.exports = {
  getRoom,
  createRoom,
  sendMessage,
};
