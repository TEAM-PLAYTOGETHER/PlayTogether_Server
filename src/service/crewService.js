const db = require('../loaders/db');
const { crewDao, crewUserDao } = require('../db');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const { createCrewCode } = require('../lib/createCrewCode');

/**
 * createCrew
 * 동아리 생성 서비스
 * @param name - 생성할 동아리 이름
 * @param masterId - 동아리장 유저 id값
 */
const createCrew = async (name, masterId) => {
  let client;
  const log = `crewDao.createCrew | name = ${name}, masterId = ${masterId}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    let code = '';
    let ok = false;

    // db에 존재하는 모든 코드들을 가져옴
    const existCodes = await crewDao.getAllCrewCode(client);

    // 유일한 코드가 될 때까지 대문자 6자 랜덤 코드 생성
    while (!ok) {
      code = createCrewCode();
      const exist = existCodes.find((data) => data.code === code);
      if (!exist) {
        ok = true;
      }
    }

    // 동아리 생성
    const createdCrew = await crewDao.createCrew(client, name, code, masterId);
    if (!createCrew) throw new Error('createCrew 동아리 생성 중 오류 발생');

    // 동아리장을 생성된 동아리에 가입시킴
    const cnt = await crewUserDao.registerCrewMember(client, createdCrew.id, masterId);
    if (cnt !== 1) throw new Error('createCrew 회원 추가 중 오류 발생');

    await client.query('COMMIT');

    return util.success(statusCode.OK, responseMessage.CREW_CREATE_SUCCESS, createdCrew);
  } catch (error) {
    console.log('createCrew error 발생: ' + error.message);
    await client.query('ROLLBACK');

    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  } finally {
    client.release();
  }
};

/**
 * registerMember
 * 동아리에 회원 등록시키는 서비스
 * @param userId - 가입할 회원의 id값
 * @param crewCode - 가입할 동아리의 코드
 */
const registerMember = async (userId, crewCode) => {
  let client;
  const log = `crewDao.registerMember | userId = ${userId}, crewCode = ${crewCode}`;

  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 인자로 받은 가입코드와 일치하는 동아리 찾기
    const crew = await crewDao.getCrewByCode(client, crewCode);
    if (!crew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    // 해당 회원이 이미 그 동아리에 가입했는지 확인
    const alreadyRegistered = await crewUserDao.getRegisteredMember(client, crew.id, userId);
    if (alreadyRegistered) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.ALREADY_REGISTERED);
    }

    // 해당 회원을 동아리에 가입시킴
    const cnt = await crewUserDao.registerCrewMember(client, crew.id, userId);
    if (cnt !== 1) throw new Error('registerMember 회원 등록과정에서 오류 발생');

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.CREW_REGISTER_SUCCESS, { crewName: crew.name });
  } catch (error) {
    console.log('registerMember에서 오류 발생: ' + error.message);
    await client.query('ROLLBACK');

    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  } finally {
    client.release();
  }
};

/**
 * getAllCrewByUserId
 * 회원이 가입한 모든 동아리의 정보 반환해주는 서비스
 * @param userId - 회원의 id값
 */
const getAllCrewByUserId = async (userId) => {
  let client;
  const log = `crewDao.registerMember | userId = ${userId}`;

  try {
    client = await db.connect(log);

    // 가입된 crew 정보들을 가져옴
    const crews = await crewUserDao.getAllCrewByUserId(client, userId);
    return util.success(statusCode.OK, responseMessage.READ_REGISTER_INFO_SUCCESS, { list: crews });
  } catch (error) {
    console.log('getAllCrewByUserId에서 오류 발생: ' + error);
    return util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR);
  } finally {
    client.release();
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
