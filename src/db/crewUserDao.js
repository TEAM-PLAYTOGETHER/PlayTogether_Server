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

const getRegisteredMember = async (crewId, memberId) => {
  let client;
  const log = `crewUserDao.getRegisteredMember | crewId = ${crewId}, memberId=${memberId}; `;
  try {
    client = await db.connect(log);

    const { rows } = await client.query(
      `
        select * from crew_user
        where crew_id = $1 and member_id = $2
      `,
      [crewId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + '에서 오류 발생' + error);
    return null;
  } finally {
    client.release();
  }
};

const getAllCrewByUserId = async (userId) => {
  let client;
  const log = `crewUserDao.getAllCrewByUserId | userId = ${userId}`;
  try {
    client = await db.connect(log);

    const { rows } = await client.query(
      `
      select c.id, c.name
      from crew_user cu
      left join crew c on cu.crew_id = c.id
      where member_id = $1;
      `,
      [userId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    console.log(log + '에서 오류 발생' + error);
    return null;
  } finally {
    client.release();
  }
};

// TODO: 일단 soft delete 적용 안했습니다.
const withdrawAllMemberByCrewId = async (crewId) => {
  let client;
  const log = `crewUserDao.withdrawAllMemberByCrewId | crewId = ${crewId}`;
  try {
    client = await db.connect(log);

    const { rowCount } = await client.query(
      `
      delete from crew_user
      where crew_id = $1;
      `,
      [crewId],
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
  getRegisteredMember,
  getAllCrewByUserId,
  withdrawAllMemberByCrewId,
};
