const { testService } = require('../service');

const db = require('../loaders/db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

// http://localhost:3000/api/test/login?id=1
const testLogin = async (req, res) => {
  console.log(req.query);
  const userId = req.query.id;

  let client;

  try {
    client = await db.connect(req);

    const data = await testService.testLogin(client, userId);

    return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, data));
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
};

const testSignup = async (req, res) => {
  let data = await testService.testSignup();
  return res.status(200).json(util.success(statusCode.OK, responseMessage.CREATED_USER, data));
};

module.exports = {
  testLogin,
  testSignup,
};
