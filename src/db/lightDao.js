const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const _ = require('lodash');

const addLight = async (client, category, title, date, place, people_cnt, description, image, organizerId, crewId, time) => {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO light (category, title, date, place, people_cnt, description, image, is_deleted, created_at, updated_at, organizer_id, crew_id, time) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, FALSE, now(), now(), $8, $9, $10)
      RETURNING *
      `,
      [category, title, date, place, people_cnt, description, image, organizerId, crewId, time],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('lightdao.addLight에서 에러 발생했습니다' + error);
  }
};
const addLightOrganizer = async (client, organizerId) => {
  try {
    const { rows } = await client.query(
      `
      INSERT into light_user (light_id, member_id)
      select id, organizer_id from light
      where organizer_id = $1;
      `,
      [organizerId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('lightdao.addLightOrganizer에서 에러 발생했습니다' + error);
  }
};

const putLight = async (client, lightId, organizerId, category, title, date, place, people_cnt, description, time) => {
  try {
    const { rows: existingRows } = await client.query(
      `
      SELECT * FROM light l
      WHERE id = $1 and organizer_id = $2
      `,
      [lightId, organizerId],
    );

    if (existingRows.length === 0) return false;

    const data = _.merge({}, convertSnakeToCamel.keysToCamel(existingRows[0]), { category, title, date, place, people_cnt, description, time });

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
    throw new Error('lightdao.putLight에서 에러 발생했습니다' + error);
  }
};

const deleteLight = async (client, lightId, organizerId) => {
  try {
    await client.query(
      `
      DELETE FROM light 
      WHERE id = $1 AND organizer_id = $2
      `,
      [lightId, organizerId],
    );
  } catch (error) {
    throw new Error('lightdao.deleteLight에서 에러 발생했습니다' + error);
  }
};

const getOrganizerLight = async (client, organizerId) => {
  try {
    const { rows } = await client.query(
      `
      select l.id, join_cnt, category, title, date, time, people_cnt, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) lu
      on l.id = lu.light_id
      where organizer_id = $1;
      `,
      [organizerId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getOrganizerLight에서 에러 발생했습니다' + error);
  }
};
const getEnterLight = async (client, memberId) => {
  try {
    const { rows } = await client.query(
      `
      select ll.id, ll.title, ll.category, join_cnt, ll.date, ll.place, ll.people_cnt, ll.time
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
    throw new Error('lightdao.getEnterLight에서 에러 발생했습니다' + error);
  }
};
const getScrapLight = async (client, memberId) => {
  try {
    const { rows } = await client.query(
      `
      select ll.id, ll.title, ll.category, join_cnt, ll.date, ll.place, ll.people_cnt, ll.time
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
    throw new Error('lightdao.getScrapLight에서 에러 발생했습니다' + error);
  }
};
const getCategoryLight = async (client, category, sort) => {
  try {
    const { rows } = await client.query(
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
    throw new Error('lightdao.getCategoryLight에서 에러 발생했습니다' + error);
  }
};
const getLightDetail = async (client, lightId) => {
  try {
    const { rows } = await client.query(
      `
      select l.id, category, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      where l.id = $1;
      `,
      [lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getLightDetail에서 에러 발생했습니다' + error);
  }
};
const getLightDetailMember = async (client, lightId) => {
  try {
    const { rows } = await client.query(
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
    throw new Error('lightdao.getLightDetailMember에서 에러 발생했습니다' + error);
  }
};
const getLightDetailOrganizer = async (client, lightId) => {
  try {
    const { rows } = await client.query(
      `
      select u.id, name, user_login_id from "user" u
      inner join light l on u.id = l.organizer_id
      where l.id = $1;
      `,
      [lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getLightDetailOrganizer에서 에러 발생했습니다' + error);
  }
};
const getLightOrganizerById = async (client, lightId, organizerId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM light l
      WHERE id = $1 and organizer_id = $2
      `,
      [lightId, organizerId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('lightdao.getLightOrganizerById에서 에러 발생했습니다' + error);
  }
};
const getExistLight = async (client, lightId) => {
  try {
    const { rows } = await client.query(
      `
      select * from light
      where id = $1;
      `,
      [lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('lightdao.getExistLight에서 에러 발생했습니다' + error);
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
  addLightOrganizer,
};
