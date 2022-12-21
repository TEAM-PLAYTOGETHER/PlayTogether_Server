const getTotalPage = (totalCount, pageSize) => {
  let totalPage = Math.floor(totalCount / pageSize);
  if (totalCount % pageSize !== 0) {
    totalPage += 1;
  }
  return totalPage;
};

module.exports = {
  getTotalPage,
};
