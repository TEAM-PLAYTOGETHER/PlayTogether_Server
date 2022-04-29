const db = require('../loaders/db');

const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const createCrew = async (name, code, masterId) => {
  let client;
  const log = `crewDao.createCrew | name = ${name}, code=${code}, masterId=${masterId}`;
  try {
    client = await db.connect(log);

    const { rows } = await client.query(
      `
        insert into crew (name, code, master_id)
        values ($1, $2, $3)
        returning id, name, code
            `,
      [name, code, masterId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + '에서 오류 발생' + error);
    return null;
  } finally {
    client.release();
  }
};

const getCrewByCode = async (code) => {
  let client;
  const log = `crewDao.getCrewByCode | code = ${code}`;
  try {
    client = await db.connect(log);

    const { rows } = await client.query(
      `
        select * from crew
        where code = $1
            `,
      [code],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + '에서 오류 발생' + error);
    return null;
  } finally {
    client.release();
  }
};

module.exports = {
  createCrew,
  getCrewByCode,
};
