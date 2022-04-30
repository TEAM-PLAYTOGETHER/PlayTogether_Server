const { crewDao, crewUserDao } = require('../db');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const { createCrewCode } = require('../lib/createCrewCode');

const createCrew = async (name, masterId) => {
  try {
    let code = '';
    let ok = false;

    // 유일한 코드가 될 때까지 대문자 6자 랜덤 코드 생성
    while (!ok) {
      code = createCrewCode();
      const exist = await crewDao.getCrewByCode(code);
      if (exist === null) throw new Error();
      if (!exist) {
        ok = true;
      }
    }

    const createdCrew = await crewDao.createCrew(name, code, masterId);
    if (!createdCrew) throw new Error();

    const cnt = await crewUserDao.registerCrewMember(createdCrew.id, masterId);
    if (cnt !== 1) throw new Error();

    return util.success(statusCode.OK, responseMessage.CREW_CREATE_SUCCESS, createdCrew);
  } catch (error) {
    console.log('createCrew error 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

const registerMember = async (userId, crewCode) => {
  try {
    const crew = await crewDao.getCrewByCode(crewCode);
    if (crew === null) throw new Error();
    if (!crew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    const alreadyRegistered = await crewUserDao.getRegisteredMember(crew.id, userId);
    if (alreadyRegistered === null) throw new Error();
    if (alreadyRegistered) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_REGISTERED);
    }

    const cnt = await crewUserDao.registerCrewMember(crew.id, userId);
    if (cnt !== 1) throw new Error();

    return util.success(statusCode.OK, responseMessage.CREW_REGISTER_SUCCESS, { crewName: crew.name });
  } catch (error) {
    console.log('registerMember에서 오류 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

const getAllCrewByUserId = async (userId) => {
  try {
    const crews = await crewUserDao.getAllCrewByUserId(userId);
    return util.success(statusCode.OK, responseMessage.READ_REGISTER_INFO_SUCCESS, { list: crews });
  } catch (error) {
    console.log('registerMember에서 오류 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

// 삭제 로직
// 1. 내가 대빵인지 확인
// 2. 멤버 모두 탈퇴시키기
// 3. 동아리 삭제하기
const deleteCrewByCrewId = async (userId, crewCode) => {
  try {
    const crew = await crewDao.getCrewByCode(crewCode);
    if (crew === null) throw new Error();
    if (!crew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    if (userId !== crew.masterId) {
      return util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_MASTER_USER);
    }

    let cnt = await crewUserDao.withdrawAllMemberByCrewId(crew.id);
    if (cnt === null) throw new Error();

    cnt = await crewDao.deleteCrewByCrewId(crew.id);
    if (cnt !== 1) throw new Error();

    return util.success(statusCode.OK, responseMessage.CREW_DELETE_SUCCESS);
  } catch (error) {
    console.log('deleteCrewByCrewId에서 오류 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  createCrew,
  registerMember,
  getAllCrewByUserId,
  deleteCrewByCrewId,
};
