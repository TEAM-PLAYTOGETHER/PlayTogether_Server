const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

/**
 * createCrew
 * 동아리 생성하는 메서드
 * @param name - 동아리 이름
 * @param code - 동아리 가입 코드
 * @param masterId - 동아리장 id값
 * @returns 생성된 crew의 name, code, masterId
 */
const createCrew = async (client, name, code, masterId) => {
  try {
    const { rows } = await client.query(
      `
        insert into crew (name, code, master_id)
        values ($1, $2, $3)
        returning id, name, code
            `,
      [name, code, masterId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('crewDao.createCrew에서 오류 발생: ' + error);
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
    throw new Error('crewDao.getCrewByCode에서 오류 발생: ' + error);
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
    throw new Error('crewDao.getAllCrewCode에서 오류 발생: ' + error);
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
    throw new Error('crewDao.deleteCrewByCrewId에서 오류 발생: ' + error);
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
    throw new Error('crewDao.getExistCrew에서 오류 발생: ' + error);
  }
};

module.exports = {
  createCrew,
  getCrewByCode,
  deleteCrewByCrewId,
  getExistCrew,
  getAllCrewCode,
};
