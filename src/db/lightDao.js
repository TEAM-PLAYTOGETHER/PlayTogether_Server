const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const _ = require('lodash');

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
const putLight = async (client, lightId, category, title, date, place, people_cnt, description, time) => {
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
};

module.exports = {
    addLight,
    putLight
};
