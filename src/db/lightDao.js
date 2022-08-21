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
    throw new Error('lightdao.addLight에서 에러 발생했습니다 \n' + error);
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
    throw new Error('lightdao.addLightOrganizer에서 에러 발생했습니다 \n' + error);
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
    throw new Error('lightdao.putLight에서 에러 발생했습니다 \n' + error);
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
    throw new Error('lightdao.deleteLight에서 에러 발생했습니다 \n' + error);
  }
};

const getOrganizerLight = async (client, organizerId, crewId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `
      select l.id, join_cnt, scp_cnt, category, title, date, time, people_cnt, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) lu on l.id = lu.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      where organizer_id = $1 and crew_id = $2
      offset $3
      limit $4;
      `,
      [organizerId, crewId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getOrganizerLight에서 에러 발생했습니다 \n' + error);
  }
};
const getEnterLight = async (client, memberId, crewId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `
      select ll.id, ll.title, scp_cnt, ll.category, join_cnt, ll.date, ll.place, ll.people_cnt, ll.time
      from light ll
         right join (select lu.light_id, join_cnt
                    from light_user lu
                             left join (select light_id, count(id) join_cnt from light_user group by light_id) l_cnt
                                       on lu.light_id = l_cnt.light_id
                    where member_id = $1) ls on ll.id = ls.light_id
                    left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on ll.id = ld.light_id
                    where crew_id = $2
                    offset $3
                    limit $4;
      `,
      [memberId, crewId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getEnterLight에서 에러 발생했습니다 \n' + error);
  }
};
const getScrapLight = async (client, memberId, crewId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `
      select ll.id, ll.title, scp_cnt, ll.category, join_cnt, ll.date, ll.place, ll.people_cnt, ll.time
      from light ll
         right join (select lu.light_id, join_cnt
                    from scrap lu
                             left join (select light_id, count(id) join_cnt from light_user group by light_id) l_cnt
                                       on lu.light_id = l_cnt.light_id
                                       where member_id = $1) ls on ll.id = ls.light_id
                                       left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on ll.id = ld.light_id
                                       where crew_id = $2
                                       offset $3
                                       limit $4;
      `,
      [memberId, crewId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getScrapLight에서 에러 발생했습니다 \n' + error);
  }
};
const getCategoryLight = async (client, crewId, category, sort, offset, limit) => {
  try {
    const { rows } = await client.query(
      `
      select l.id, l.category, scp_cnt, l.title, join_cnt, l.date, l.place, l.people_cnt, l.time from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      where category = $1 and l.crew_id = $2
      order by $3 DESC
      offset $4
      limit $5
      ;
      `,
      [category, crewId, sort, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getCategoryLight에서 에러 발생했습니다 \n' + error);
  }
};
const getLightDetail = async (client, lightId) => {
  try {
    const { rows } = await client.query(
      `
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      where l.id = $1;
      `,
      [lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getLightDetail에서 에러 발생했습니다 \n' + error);
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
    throw new Error('lightdao.getLightDetailMember에서 에러 발생했습니다 \n' + error);
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
    throw new Error('lightdao.getLightDetailOrganizer에서 에러 발생했습니다 \n' + error);
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
    throw new Error('lightdao.getLightOrganizerById에서 에러 발생했습니다 \n' + error);
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
    throw new Error('lightdao.getExistLight에서 에러 발생했습니다 \n' + error);
  }
};
const getNewLight = async (client, crewId) => {
  try {
    const { rows } = await client.query(
      `
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      where l.crew_id = $1
      order by created_at desc
      limit 5;
      `,
      [crewId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getNewLight에서 에러 발생했습니다 \n' + error);
  }
};
const getHotLight = async (client, crewId) => {
  try {
    const { rows } = await client.query(
      `
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      where scp_cnt is not null and l.crew_id = $1
      order by scp_cnt desc
      limit 5;
      `,
      [crewId]
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getHotLight에서 에러 발생했습니다 \n' + error);
  }
};
const getSearchLightUseCategory = async (client, search, crewId, category, offset, limit) => {
  try {
    const { rows } = await client.query(
      `            
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      where (l.title LIKE CONCAT('%', $1::text, '%') or l.description Like CONCAT('%', $1::text, '%')) and category = $2 and l.crew_id = $3
      offset $4
      limit $5;
      `,
      [search, crewId, category, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getSearchLightUseCategory 에러 발생했습니다 \n' + error);
  }
};
const getSearchLightNotCategory = async (client, search, crewId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `            
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      where (l.title LIKE CONCAT('%', $1::text, '%') or l.description Like CONCAT('%', $1::text, '%')) and l.crew_id = $2
      offset $3
      limit $4;
      `,
      [search, crewId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getSearchLightNotCategory 에러 발생했습니다 \n' + error);
  }
};
const IsLightOrganizer = async (client, lightId, userId) => {
  try {
    const { rows } = await client.query(
      `
      select l.id from light l
      where l.id = $1 and l.organizer_id = $2
      `,
      [lightId, userId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('lightdao.IsLightOrganizer 에러 발생했습니다 \n' + error);
  }
};
const getSearchLightUseCategoryInMyEnterLight = async (client, search, category, crewId,memberId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `            
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      inner join light_user lu on l.id = lu.light_id
      where (l.title LIKE CONCAT('%', $1::text, '%') or l.description Like CONCAT('%', $1::text, '%')) and category = $2 and l.crew_id = $3
      and lu.member_id = $4
      offset $5
      limit $6;
      `,
      [search, category, crewId, memberId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getSearchLightUseCategoryInMyEnterLight 에러 발생했습니다 \n' + error);
  }
};
const getSearchLightNotCategoryInMyEnterLight = async (client, search, crewId, memberId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `            
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      inner join light_user lu on l.id = lu.light_id
      where (l.title LIKE CONCAT('%', $1::text, '%') or l.description Like CONCAT('%', $1::text, '%')) and l.crew_id = $2
      and lu.member_id = $3
      offset $4
      limit $5;
      `,
      [search, crewId, memberId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getSearchLightNotCategoryInMyEnterLight 에러 발생했습니다 \n' + error);
  }
};
const getSearchLightUseCategoryInMyScrapLight = async (client, search, category, crewId,memberId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `            
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      inner join scrap s on l.id = s.light_id
      where (l.title LIKE CONCAT('%', $1::text, '%') or l.description Like CONCAT('%', $1::text, '%')) and category = $2 and l.crew_id = $3
      and s.member_id = $4
      offset $5
      limit $6;
      `,
      [search, category, crewId, memberId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getSearchLightUseCategoryInMyScrapLight 에러 발생했습니다 \n' + error);
  }
};
const getSearchLightNotCategoryInMyScrapLight = async (client, search, crewId, memberId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `            
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      inner join scrap s on l.id = s.light_id
      where (l.title LIKE CONCAT('%', $1::text, '%') or l.description Like CONCAT('%', $1::text, '%')) and l.crew_id = $2
      and s.member_id = $3
      offset $4
      limit $5;
      `,
      [search, crewId, memberId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getSearchLightNotCategoryInMyScrapLight 에러 발생했습니다 \n' + error);
  }
};
const getSearchLightUseCategoryInMyOpenLight = async (client, search, category, crewId,memberId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `            
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      where (l.title LIKE CONCAT('%', $1::text, '%') or l.description Like CONCAT('%', $1::text, '%')) and category = $2 and l.crew_id = $3
      and l.organizer_id = $4
      offset $5
      limit $6;
      `,
      [search, category, crewId, memberId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getSearchLightUseCategoryInMyOpenLight 에러 발생했습니다 \n' + error);
  }
};

const getSearchLightNotCategoryInMyOpenLight = async (client, search, crewId, memberId, offset, limit) => {
  try {
    const { rows } = await client.query(
      `            
      select l.id, category, scp_cnt, join_cnt, title, date, time, people_cnt, description, image, place from light l
      left join (select light_id, count(id) join_cnt from light_user group by light_id) ls on l.id = ls.light_id
      left join (select light_id, count(id) scp_cnt from scrap group by light_id) ld on l.id = ld.light_id
      where (l.title LIKE CONCAT('%', $1::text, '%') or l.description Like CONCAT('%', $1::text, '%')) and l.crew_id = $2
      and l.organizer_id = $3
      offset $4
      limit $5;
      `,
      [search, crewId, memberId, offset, limit],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('lightdao.getSearchLightNotCategoryInMyOpenLight 에러 발생했습니다 \n' + error);
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
  getNewLight,
  getHotLight,
  getSearchLightUseCategory,
  getSearchLightNotCategory,
  IsLightOrganizer,
  getSearchLightUseCategoryInMyEnterLight,
  getSearchLightNotCategoryInMyEnterLight,
  getSearchLightUseCategoryInMyScrapLight,
  getSearchLightNotCategoryInMyScrapLight,
  getSearchLightUseCategoryInMyOpenLight,
  getSearchLightNotCategoryInMyOpenLight

};
