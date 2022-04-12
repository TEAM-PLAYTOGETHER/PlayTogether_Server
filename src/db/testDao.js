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

module.exports = {
  getUserNameById,
};
