const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

// CREATE
/**
 * registerCrewMember
 * 동아리에 회원을 가입시키는 메서드
 * @param crewId - 가입할 동아리의 id값
 * @param memberId - 가입할 회원의 id값
 * @returns - 가입한 회원의 수 (1이 정상)
 */
const registerCrewMember = async (client, crewId, memberId) => {
  try {
    const { rowCount } = await client.query(
      `
        insert into crew_user (crew_id, member_id)
        values ($1, $2)
    `,
      [crewId, memberId],
    );
    return rowCount;
  } catch (error) {
    throw new Error('crewUserDao.registerCrewMember에서 오류 발생: \n' + error);
  }
};

// READ
/**
 * getUserRegisteredCount
 * 회원이 가입한 동아리의 갯수를 반환하는 메서드
 * @param {*} userId - 회원의 id값
 * @returns - 회원이 가입한 동아리의 갯수
 */
const getUserRegisteredCount = async (client, userId) => {
  try {
    const { rows } = await client.query(
      `
        select count(*) from crew_user
        where member_id = $1;
      `,
      [userId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('crewUserDao.getUserRegisteredCount에서 오류 발생: \n' + error);
  }
};

/**
 * getRegisteredMember
 * 해당 회원이 이미 해당 동아리에 가입했는지 확인해주는 메서드
 * @param crewId - 검사할 동아리의 id값
 * @param memberId - 검사할 회원의 id값
 * @returns 회원의 가입 정보
 */
const getRegisteredMember = async (client, crewId, memberId) => {
  try {
    const { rows } = await client.query(
      `
        select * from crew_user
        where crew_id = $1 and member_id = $2
      `,
      [crewId, memberId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('crewUserDao.getRegisteredMember에서 오류 발생: \n' + error);
  }
};

/**
 * getAllCrewByUserId
 * 회원이 가입한 모든 동아리 정보 return
 * @param {*} userId - 회원의 id값
 * @returns - 회원이 가입한 모든 동아리 정보
 */
const getAllCrewByUserId = async (client, userId) => {
  try {
    const { rows } = await client.query(
      `
      select c.id, c.code, c.name, c.description, c.master_id
      from crew_user cu
      left join crew c on cu.crew_id = c.id
      where member_id = $1;
      `,
      [userId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } catch (error) {
    throw new Error('crewUserDao.getAllCrewByUserId에서 오류 발생: \n' + error);
  }
};

// UPDATE
/**
 * updateCrewUserProfile
 * 해당 동아리에 유저 프로필 작성
 * @param {*} memberId
 * @param {*} crewId
 * @param {*} nickname
 * @param {*} description
 * @param {Optional} firstStation
 * @param {Optional} secondStation
 * @returns 새로 생성된 프로필 정보
 */
const updateCrewUserProfile = async (client, memberId, crewId, nickname, description, firstStation, secondStation) => {
  try {
    const { rows } = await client.query(
      `
      update crew_user
      set nickname = $1, description = $2, first_station = $3, second_station = $4
      where member_id = $5 AND crew_id = $6 AND is_deleted = false
      `,
      [nickname, description, firstStation, secondStation, memberId, crewId],
    );

    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('crewUserDao.updateCrewUserProfile에서 오류 발생: \n' + error);
  }
};
const updateCrewUserProfileImage = async (client, memberId, crewId, image) => {
  try {
    const { rows } = await client.query(
      `
      update crew_user
      set profile_image = $1
      where member_id = $2 AND crew_id = $3 AND is_deleted = false
      `,
      [image, memberId, crewId],
    );

    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('crewUserDao.updateCrewUserProfileImage 오류 발생: \n' + error);
  }
};

// DELETE
/**
 * withdrawAllMemberByCrewId
 * 동아리의 모든 멤버 탈퇴
 * @param {*} crewId - 동아리의 id값
 * @returns 탈퇴처리된 회원의 수
 */
const withdrawAllMemberByCrewId = async (client, crewId) => {
  // TODO: 일단 soft delete 적용 안했습니다.
  try {
    const { rowCount } = await client.query(
      `
      delete from crew_user
      where crew_id = $1;
      `,
      [crewId],
    );
    return rowCount;
  } catch (error) {
    throw new Error('crewUserDao.withdrawAllMemberByCrewId에서 오류 발생: \n' + error);
  }
};

/**
 * withDrawCrew
 * 동아리 탈퇴
 * @param {*} userId - 유저 아이디
 * @param {*} crewId - 탈퇴하고자 하는 동아리 아이디
 */
const withDrawCrew = async (client, userId, crewId) => {
  try {
    const { rowCount } = await client.query(
      `
      DELETE FROM crew_user
      WHERE member_id = $1 AND crew_id = $2
      `,
      [userId, crewId],
    );
  } catch (error) {
    throw new Error('crewUserDao.withDrawCrew에서 오류 발생: \n' + error);
  }
};

module.exports = {
  registerCrewMember,
  getRegisteredMember,
  getAllCrewByUserId,
  withdrawAllMemberByCrewId,
  withDrawCrew,
  getUserRegisteredCount,
  updateCrewUserProfile,
  updateCrewUserProfileImage,
};
