const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const _ = require('lodash');

const reportLight = async (client, report, memberId, lightId) => {
  try {
    const { rows } = await client.query(
      `
        INSERT INTO report_light
        (report_description, member_id, light_id, created_at, updated_at)
        VALUES
        ($1, $2, $3, now(), now())
        `,
      [report, memberId, lightId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('reportLightDao.reportLight 에러 발생했습니다 \n' + error);
  }
};

module.exports = {
  reportLight,
};
