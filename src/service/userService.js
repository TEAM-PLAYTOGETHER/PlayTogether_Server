const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const { userDao } = require('../db');
const util = require('../lib/util');
const db = require('../loaders/db');

const { nicknameVerify } = require('../lib/nicknameVerify');

const getUserByUserLoginId = async (userLoginId) => {
  let client;
  const log = `userService.getUserByUserLoginId | userLoginId = ${userLoginId}`;

  try {
    client = await db.connect(log);

    const user = await userDao.getUserByUserLoginId(client, userLoginId);

    // 해당 유저가 없는 경우
    if (!user) {
      return util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER);
    }

    // 만 나이 계산 로직 -> 따로 분리하는게 좋을지도
    const now = new Date();
    const birth = new Date(user.birthDay);

    let age = now.getFullYear() - birth.getFullYear();
    const month = now.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) {
      age--;
    }

    const userData = {
      userLoginId: user.userLoginId,
      name: user.name,
      gender: user.gender,
      age: age,
      mbti: user.mbti,
    };

    return util.success(statusCode.OK, responseMessage.GET_USER_SUCCESS, userData);
  } catch (error) {
    throw new Error('userService getUserByLoginId에서 error 발생: \n' + error);
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

const updateUserMbti = async (userId, mbti) => {
  let client;
  const log = `userService.updateUserMbti | mbit = ${mbti}`;
  try {
    client = await db.connect(log);

    const user = await userDao.getUserById(client, userId);

    // 해당 유저가 없는 경우
    if (!user) {
      return util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER);
    }

    const updateUser = await userDao.updateUserMbti(client, userId, mbti);

    return util.success(statusCode.OK, responseMessage.UPDATE_USER_SUCCESS, updateUser);
  } catch (error) {
    throw new Error('userService updateUserMbti에서 error 발생: \n' + error);
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
  getUserByUserLoginId,
  getUserById,
  getUserByNickname,
  updateUserMbti,
};
