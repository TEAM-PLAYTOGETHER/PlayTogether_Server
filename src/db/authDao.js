const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const db = require('../loaders/db');

// CREATE
const createSnsUser = async (client, snsId, email, provider, name, picture) => {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO "user" (email, sns_id, provider, name, picture)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [email, snsId, provider, name, picture],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('authDao.createSnsUser에서 오류 발생: \n' + error);
  }
};

// READ
const getFcmTokenById = async (client, userId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT device_token
      FROM "user"
      WHERE id = $1
      `,
      [userId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('authDao.getFcmTokenById에서 오류 발생: \n' + error);
  }
};

const getUserByRefreshToken = async (client, token) => {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM "user"
      WHERE refresh_token = $1
      `,
      [token],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('authDao.getUserByRefreshToken에서 오류 발생: \n' + error);
  }
};

// UPDATE
const updateSnsUser = async (client, snsId, email, name, picture) => {
  try {
    const { rows } = await client.query(
      `
      UPDATE "user"
      SET email = $1, name = $2, picture = $3
      WHERE sns_id = $4
      RETURNING *
      `,
      [email, name, picture, snsId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('authDao.updateSnsUser에서 오류 발생: \n' + error);
  }
};

const updateFcmToken = async (client, snsId, fcmToken) => {
  try {
    const { rows } = await client.query(
      `
      UPDATE "user"
      SET device_token = $1
      WHERE sns_id = $2
      RETURNING *
      `,
      [fcmToken, snsId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('authDao.updateFcmToken에서 오류 발생: \n' + error);
  }
};

const updateRefreshToken = async (client, userId, refreshToken) => {
  try {
    const { rows } = await client.query(
      `
      UPDATE "user"
      SET refresh_token = $1
      WHERE id = $2
      `,
      [refreshToken, userId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  } catch (error) {
    throw new Error('authDao.updateRefreshToken에서 오류 발생: \n' + error);
  }
};

// DELETE
const deleteUser = async (client, userId) => {
  try {
    const { rows } = await client.query(
      `
      DELETE FROM "user"
      WHERE id = $1
      `,
      [userId],
    );
  } catch (error) {
    throw new Error('authDao.deleteUser에서 오류 발생: \n' + error);
  }
};

module.exports = {
  createSnsUser,
  getFcmTokenById,
  getUserByRefreshToken,
  updateSnsUser,
  updateFcmToken,
  updateRefreshToken,
  deleteUser,
};
