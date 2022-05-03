const db = require('../loaders/db');

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

const getUserById = async (userId) => {
  let client;
  try {
    const log = `testDao.getUserById | userId = ${userId}`;
    client = await db.connect(log);

    const { rows } = await client.query(
      `
      select * from "user"
      where id = $1
      and is_deleted = false
      `,
      [userId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(error);
    // return
  } finally {
    client.release();
  }
};

module.exports = {
  getUserNameById,
  getUserById,
};
