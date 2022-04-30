const { lightDao } = require('../db');

const addLight = async (client, category, title, date, place, people_cnt, description, image, organizerId, crewId, time) => {
  try {
    const data = await lightDao.addLight(client, category, title, date, place
        , people_cnt, description,image, organizerId, crewId, time);
    return data;
  } catch (error) {
    console.log(error);
  }
};

const putLight = async (client, lightId, category, title, date, place, people_cnt, description, time) => {
  try {
    const data = await lightDao.putLight(client, lightId, category,title, date, place
      , people_cnt, description, time);
    return data;
  } catch (error) {
    console.log(error);
const postEnterLight = async (lightId, memberId) => {
  try {
    await lightDao.postEnterLight(lightId, memberId);
  } catch (error) {
    console.log('postEnterLight error 발생'+ error);
  }
}
const checkLightEnterd = async (lightId, memberId) => {
  try {
    const data = await lightDao.checkLightEnterd(lightId, memberId);
    const enterd = data === 0 ? false : true;
    return {
      enterd
    };
  } catch (error) {
    console.log('checkLightEnterd error 발생'+ error);
  }
}


module.exports = {
    addLight,
    putLight
    postEnterLight,
    checkLightEnterd
};
