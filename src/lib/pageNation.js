const getTotalPage = (totalCount, pageSize) => {
    let totalPage = (totalCount / pageSize);
    if ((totalCount % pageSize) !== 0) {
        totalPage += 1;
    }
    return Math.round(totalPage);
};

module.exports = {
    getTotalPage
};