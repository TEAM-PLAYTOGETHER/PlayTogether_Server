const db = require('../loaders/db');

const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const registerCrewMember = async (crewId, memberId) => {
  let client;
  const log = `crewUserDao.registerCrewMember | crewId = ${crewId}, memberId=${memberId}; `;
  try {
    client = await db.connect(log);

    const { rowCount } = await client.query(
      `
        insert into crew_user (crew_id, member_id)
        values ($1, $2)
    `,
      [crewId, memberId],
    );
    return rowCount;
  } catch (error) {
    console.log(log + '에서 오류 발생' + error);
    return null;
  } finally {
    client.release();
  }
};

module.exports = {
  registerCrewMember,
};
