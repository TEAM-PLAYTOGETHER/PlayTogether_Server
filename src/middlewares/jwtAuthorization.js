// TODO: userDao 생기면 jwt 미들웨어 완성하기

/*
const jwt = require('jsonwebtoken');

const config = require("../config");
const util = require('../lib/util');
const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');

const loginMiddleware = async (req, res, next) => {
  if (req.headers.authorization === '' || req.headers.authorization === null || req.headers.authorization === undefined) {
    return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, '로그인이 필요합니다.'));
  }

  try {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, config.jwt.secret);

      const user = await 

  }
*/
