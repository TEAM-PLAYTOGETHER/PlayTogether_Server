const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addLight = async (client, category, title, date, place, people_cnt, description, image, organizerId, crewId, time) => {
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
};

module.exports = {
    addLight,
};
