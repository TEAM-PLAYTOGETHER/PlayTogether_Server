const moment = require('moment');

const calculateAge = (birthday) => {
  const startDate = new Date();
  const endDate = new Date(birthday);
  return Math.abs(moment.duration(endDate - startDate).years());
};

module.exports = {
  calculateAge,
};
