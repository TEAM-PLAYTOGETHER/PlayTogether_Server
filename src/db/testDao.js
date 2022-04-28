const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserNameById = async (client, userId) => {
  const { rows } = await client.query(
    `
    select * from test where id = $1
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserById = async (client, userId) => {
  const { rows } = await client.query(
    `
    select * from "user"
    where id = $1
    and is_deleted = false
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getUserNameById,
  getUserById,
};
