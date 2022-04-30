const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const _ = require('lodash');
const db = require('../loaders/db');


const addLight = async (category, title, date, place, people_cnt, description, image, organizerId, crewId, time) => {
  let client;

  const log = `lightDao.addLight | category = ${category}, title = ${title}, date = ${date}, place = ${place}
  , people_cnt = ${people_cnt}, description = ${description}, image = ${image}, organizerId = ${organizerId},
  , crewId = ${crewId}, time = ${time}`;
  try {
    client = await db.connect(log);
    const { rows } = await client.query(
      `
      INSERT INTO light (category, title, date, place, people_cnt, description, image, is_deleted, created_at, updated_at, organizer_id, crew_id, time) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, FALSE, now(), now(), $8, $9, $10)
      RETURNING *
      `,
      [category, title, date, place, people_cnt, description, image,  organizerId, crewId, time],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생");
    return null;
  } finally {
    client.release();
  }
};
const putLight = async (lightId, category, title, date, place, people_cnt, description, time) => {
  let client;

  const log = `lightDao.putLight | category = ${category}, title = ${title}, date = ${date}, place = ${place}
  , people_cnt = ${people_cnt}, description = ${description}`;
  try {
    client = await db.connect(log);
    const { rows: existingRows } = await client.query(
      `
      SELECT * FROM light l
      WHERE id = $1
         AND is_deleted = FALSE
      `,
      [lightId],
    );
  
    if (existingRows.length === 0) return false;
  
    const data = _.merge({}, convertSnakeToCamel.keysToCamel(existingRows[0]),
     { category, title, date, place, people_cnt, description, time});
  
    const { rows } = await client.query(
      `
      UPDATE light l
      SET category = $1, title = $2, date = $3, place = $4, people_cnt = $5, description = $6, time = $7, updated_at = now()
      WHERE id = $8
      RETURNING * 
      `,
      [data.category, data.title, data.date, data.place, data.people_cnt, data.description, data.time, lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생");
    return null;
  } finally {
    client.release();
  }
};

const postEnterLight = async (lightId, memberId) => {
  let client;

  const log = `lightDao.postEnterLight | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query(
      `
      INSERT INTO light_user
      (light_id, member_id, created_at, updated_at)
      VALUES
      ($1, $2, now(), now())
      `,
      [lightId, memberId],
    );
  } catch (error) {
    console.log(log + "에서 에러 발생");
    return null;
  } finally {
    client.release();
  }
};
const getEnterLightMember = async(lightId, memberId) => {
  let client;

  const log = `lightDao.getEnterLightMember | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const { rows } = await client.query(
      `
      SELECT * FROM light_user 
      WHERE light_id = $1 and member_id = $2
      `,
      [lightId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생");
    return null;
  } finally {
    client.release();
  }
};
const deleteCancelLight = async(lightId, memberId) => {
  let client;

  const log = `lightDao.deleteCancelLight | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query(
      `
      DELETE FROM light_user 
      WHERE light_id = $1 AND member_id = $2
      `,
      [lightId, memberId],
    );
  } catch (error) {
    console.log(log + "에서 에러 발생");
    return null;
  } finally {
    client.release();
  }
};

module.exports = {
    addLight,
    putLight,
    postEnterLight,
    getEnterLightMember,
    deleteCancelLight,
};
