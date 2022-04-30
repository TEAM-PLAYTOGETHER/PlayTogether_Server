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

module.exports = {
  createCrew,
};
