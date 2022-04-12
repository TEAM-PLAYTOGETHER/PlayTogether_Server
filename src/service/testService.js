/*
추후 db 접근 로직은 분리해서 작성
const { userDao } = require('../db');
await userDao.createUser(id, password)
*/

const { testDao } = require('../db');

const testLogin = async (client, userId) => {
  try {
    const data = await testDao.getUserNameById(client, userId);
    return data;
  } catch (error) {
    console.log(error);
  }
};

const testSignup = async () => {
  let data = {
    id: 'playtogether',
    name: '김플투',
  };
  return data;
};

module.exports = {
  testLogin,
  testSignup,
};
