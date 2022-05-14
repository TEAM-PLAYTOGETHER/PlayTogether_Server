const applyKoreanTime = (time) => {
  let dbTime = new Date(time);
  dbTime.setHours(dbTime.getHours() + 18);

  return dbTime.toISOString();
};

module.exports = {
  applyKoreanTime,
};
