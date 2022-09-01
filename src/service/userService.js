const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao, blockUserDao } = require('../db');
const util = require('../lib/util');
const db = require('../loaders/db');

const { nicknameVerify } = require('../lib/nicknameVerify');

const signup = async (userId, gender, birth) => {
  let client;
  const log = `userService.signup | userId = ${userId}, gender = ${gender}, birth = ${birth}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    await userDao.signup(client, userId, gender, birth);
    await client.query('COMMIT');

    return util.success(statusCode.OK, responseMessage.UPDATE_USER_SUCCESS);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('userService signup에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

const getCrewUserById = async (userId, crewId, memberId) => {
  let client;
  const log = `userService.getUserByEmail | userId = ${userId}, crewId = ${crewId}, memberId = ${memberId}`;

  try {
    client = await db.connect(log);

    const user = await userDao.getCrewUserById(client, crewId, memberId, userId);

    // 해당 유저가 없는 경우
    if (!user) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW_USER);
    }

    return util.success(statusCode.OK, responseMessage.GET_USER_SUCCESS, user);
  } catch (error) {
    throw new Error('userService getCrewUserById에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

const getUserById = async (userId) => {
  let client;
  const log = `userService.getUserById | userId = ${userId}`;

  try {
    client = await db.connect(log);

    const user = await userDao.getUserById(client, userId);
    // 유저가 없을 때
    if (!user) {
      return util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER);
    }

    return util.success(statusCode.OK, responseMessage.GET_USER_SUCCESS, user);
  } catch (error) {
    throw new Error('userService getUserById에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

const getUserByNickname = async (crewId, nickname) => {
  let client;
  const log = `userService.existNicknameCheck | crewId = ${crewId}, nickname = ${nickname}`;

  try {
    client = await db.connect(log);
    const user = await userDao.getUserByNickname(client, crewId, nickname);

    if (user) {
      return util.fail(statusCode.CONFLICT, responseMessage.ALREADY_NICKNAME);
    }

    if (nicknameVerify(nickname)) return util.fail(statusCode.BAD_REQUEST, responseMessage.UNUSABLE_NICKNAME);

    return util.success(statusCode.OK, responseMessage.USEABLE_NICKNAME);
  } catch (error) {
    throw new Error('userService existNicknameCheck에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

module.exports = {
  signup,
  getCrewUserById,
  getUserById,
  getUserByNickname,
};
