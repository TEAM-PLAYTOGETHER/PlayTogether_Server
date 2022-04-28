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

const getAllMessageById = async (client, userId) => {
  const { rows } = await client.query(
    `
        select room_id,
              send_id,
              m.created_at,
              content,
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
};

const getAllMessageByRoomId = async (client, roomId) => {
  const { rows } = await client.query(
    `
    select m.id, m.created_at, m.content, m.send_id
    from room r
             left join message m
                       on r.id = m.room_id
    where r.id = $1
    order by created_at desc;
    `,
    [roomId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getRoom,
  createRoom,
  sendMessage,
  getAllMessageById,
};
