const { testService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const testLogin = async (req, res) => {
  let data = await testService.testLogin();
  return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.LOGIN_SUCCESS, data));
};

const testSignup = async (req, res) => {
  let data = await testService.testSignup();
  return res.status(200).json(util.success(statusCode.OK, responseMessage.CREATED_USER, data));
};

module.exports = {
  testLogin,
  testSignup,
};
