const moment = require('moment');

const calculateAge = (birthday) => {
  const startDate = new Date();
  const endDate = new Date(birthday);
  return Math.abs(moment.duration(endDate - startDate).years());
};

const applyKoreanTime = (time) => {
  let dbTime = new Date(time);
  dbTime.setHours(dbTime.getHours() + 9);

  return dbTime.toISOString();
};

module.exports = {
  calculateAge,
  applyKoreanTime,
};
