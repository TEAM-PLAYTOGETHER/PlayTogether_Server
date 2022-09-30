const applyKoreanTime = (time) => {
  let dbTime = new Date(time);
  dbTime.setHours(dbTime.getHours() + 9);

  return dbTime.toISOString();
};

module.exports = {
  applyKoreanTime,
};
