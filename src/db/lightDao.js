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
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const addLightOrganizer = async(organizerId) => {
  let client;

  const log = `lightDao.addLightOrganizer | organizerId = ${organizerId}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      INSERT into light_user (light_id, member_id)
      select id, organizer_id from light
      where organizer_id = $1;
      `,
      [organizerId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};

const putLight = async (lightId, organizerId, category, title, date, place, people_cnt, description, time) => {
  let client;

  const log = `lightDao.putLight | lightId = ${lightId}, organizerId = ${organizerId}, 
  category = ${category}, title = ${title}, date = ${date}, place = ${place}
  , people_cnt = ${people_cnt}, description = ${description}`;
  try {
    client = await db.connect(log);
    const { rows: existingRows } = await client.query(
      `
      SELECT * FROM light l
      WHERE id = $1 and organizer_id = $2
      `,
      [lightId, organizerId],
    );
  
    if (existingRows.length === 0) return false;
  
    const data = _.merge({}, convertSnakeToCamel.keysToCamel(existingRows[0]),
     { category, title, date, place, people_cnt, description, time});
  
    const { rows } = await client.query(
      `
      UPDATE light l
      SET category = $1, title = $2, date = $3, place = $4, people_cnt = $5, description = $6, time = $7, updated_at = now()
      WHERE id = $8 and organizer_id = $9
      RETURNING * 
      `,
      [data.category, data.title, data.date, data.place, data.people_cnt, data.description, data.time, lightId, organizerId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};

const deleteLight = async(lightId, organizerId) => {
  let client;

  const log = `lightDao.deleteLight | lightId = ${lightId}, organizerId = ${organizerId}`;
  try {
    client = await db.connect(log);
    await client.query(
      `
      DELETE FROM light 
      WHERE id = $1 AND organizer_id = $2
      `,
      [lightId, organizerId],
    );
  } catch (error) {
    console.log(log + "에서 에러 발생", error);
    return null;
  } finally {
    client.release();
  }
};

const getOrganizerLight = async(organizerId) => {
  let client;

  const log = `lightDao.getOrganizerLight | organizerId = ${organizerId}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      select l.id, join_cnt, title, date, time, people_cnt, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) lu
      on l.id = lu.light_id
      where organizer_id = $1;
      `,
      [organizerId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getEnterLight = async(memberId) => {
  let client;

  const log = `lightDao.getEnterLight | memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      select ll.id, ll.title, join_cnt, ll.date, ll.place, ll.people_cnt, ll.time
      from light ll
         right join (select lu.light_id, join_cnt
                    from light_user lu
                             left join (select light_id, count(id) join_cnt from light_user group by light_id) l_cnt
                                       on lu.light_id = l_cnt.light_id
                    where member_id = $1) ls on ll.id = ls.light_id;
      `,
      [memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getScrapLight = async(memberId) => {
  let client;

  const log = `lightDao.getScrapLight | memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      select ll.id, ll.title, join_cnt, ll.date, ll.place, ll.people_cnt, ll.time
      from light ll
         right join (select lu.light_id, join_cnt
                    from scrap lu
                             left join (select light_id, count(id) join_cnt from light_user group by light_id) l_cnt
                                       on lu.light_id = l_cnt.light_id
                    where member_id = $1) ls on ll.id = ls.light_id;
      `,
      [memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getCategoryLight = async(category, sort) => {
  let client;

  const log = `lightDao.getCategoryLight | category = ${category}, sort = ${sort}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      select l.id, l.category, l.title, join_cnt, l.date, l.place, l.people_cnt, l.time from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      where category = $1
      order by $2 DESC;
      `,
      [category, sort],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getLightDetail = async(lightId) => {
  let client;

  const log = `lightDao.getLightDetail | lightId = ${lightId}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      select l.id, category, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      where l.id = $1;
      `,
      [lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getLightDetailMember = async(lightId) => {
  let client;

  const log = `lightDao.getLightDetailMember | lightId = ${lightId}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      select u.id, mbti, gender, name, birth_day from "user" u
      inner join light_user lu on u.id = lu.member_id
      inner join light l on l.id = lu.light_id
      where l.id = $1;
      `,
      [lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getLightDetailOrganizer = async(lightId) => {
  let client;

  const log = `lightDao.getLightDetailOrganizer | lightId = ${lightId}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      select name from "user"
      inner join light l on "user".id = l.organizer_id
      where l.id = $1;
      `,
      [lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getLightOrganizerById = async(organizerId) => {
  let client;

  const log = `lightDao.getLightOrganizer | organizerId = ${organizerId}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      select * from light
      where organizer_id = $1;
      `,
      [organizerId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};
const getExistLight = async(lightId) => {
  let client;

  const log = `lightDao.getExistLight | lightId = ${lightId}`;
  try {
    client = await db.connect(log);
    const { rows } =  await client.query(
      `
      select * from light
      where id = $1;
      `,
      [lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    console.log(log + "에서 에러 발생" + error);
    return null;
  } finally {
    client.release();
  }
};

module.exports = {
    addLight,
    putLight,
    deleteLight,
    getOrganizerLight,
    getEnterLight,
    getScrapLight,
    getCategoryLight,
    getLightDetail,
    getLightDetailMember,
    getLightDetailOrganizer,
    getLightOrganizerById,
    getExistLight,
    addLightOrganizer
};
