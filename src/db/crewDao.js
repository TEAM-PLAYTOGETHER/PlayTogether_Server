const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

/**
 * createCrew
 * 동아리 생성하는 메서드
 * @param name - 동아리 이름
 * @param code - 동아리 가입 코드
 * @param masterId - 동아리장 id값
 * @returns 생성된 crew의 name, code, masterId
 */
const createCrew = async (client, name, code, masterId, description) => {
  try {
    const { rows } = await client.query(
      `
        insert into crew (name, code, master_id, description)
        values ($1, $2, $3, $4)
        returning id, name, code, description
            `,
      [name, code, masterId, description],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('crewDao.createCrew에서 오류 발생: \n' + error);
  }
};

/**
 * getCreatedByUserCount
 * 해당 유저에 의해서 생성된 동아리의 갯수를 반환하는 메서드
 * @param {*} masterId - 확인할 유저의 id값
 * @returns 해당 유저가 생성한 동아리의 갯수
 */
const getCreatedByUserCount = async (client, masterId) => {
  try {
    const { rows } = await client.query(
      `
        select count(*) from crew
        where master_id = $1
      `,
      [masterId],
    );
    return convertSnakeToCamel.keysToSnake(rows[0]);
  } catch (error) {
    throw new Error('crewDao.getCreatedByUserCount에서 오류 발생: \n' + error);
  }
};

/**
 * getCrewByCode
 * 가입코드가 인자로 받은 코드와 같은 동아리를 찾아주는 메서드
 * @param code - 가입코드
 * @returns 일치하는 동아리
 */
const getCrewByCode = async (client, code) => {
  try {
    const { rows } = await client.query(
      `
        select * from crew
        where code = $1
            `,
      [code],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('crewDao.getCrewByCode에서 오류 발생: \n' + error);
  }
};

/**
 * getAllCrewCode
 * DB에 존재하는 모든 크루의 코드를 가져오는 메서드
 * @return 모든 코드들
 */
const getAllCrewCode = async (client) => {
  try {
    const { rows } = await client.query(
      `
        select code
        from crew
      `,
    );

    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('crewDao.getAllCrewCode에서 오류 발생: \n' + error);
  }
};

/**
 * deleteCrewByCrewId
 * 동아리 삭제하는 메서드
 * @param {*} crewId - 삭제할 동아리의 id값
 * @returns 삭제된 동아리 갯수
 */
const deleteCrewByCrewId = async (client, crewId) => {
  try {
    const { rowCount } = await client.query(
      `
        delete from crew
        where id = $1
            `,
      [crewId],
    );
    return rowCount;
  } catch (error) {
    throw new Error('crewDao.deleteCrewByCrewId에서 오류 발생: \n' + error);
  }
};

/**
 * getExistCrew
 * crewId로 동아리 정보 가져오기
 * @param {*} crewId - 동아리 id값
 * @returns - 검색된 동아리의 정보
 */
const getExistCrew = async (client, crewId) => {
  try {
    const { rows } = await client.query(
      `
        select * from crew
        where id = $1
            `,
      [crewId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('crewDao.getExistCrew에서 오류 발생: \n' + error);
  }
};

module.exports = {
  createCrew,
  getCreatedByUserCount,
  getCrewByCode,
  deleteCrewByCrewId,
  getExistCrew,
  getAllCrewCode,
};
