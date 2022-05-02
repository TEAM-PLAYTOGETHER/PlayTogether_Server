const { lightDao, lightUserDao } = require('../db');
const db = require('../loaders/db');
const dayjs = require('dayjs');

const addLight = async (category, title, date, place, people_cnt, description, image, organizerId, crewId, time) => {
  try {
    const data = await lightDao.addLight(category, title, date, place
        , people_cnt, description,image, organizerId, crewId, time);
    return data;
  } catch (error) {
    console.log('addLight에서 error 발생'+ error);
  }
};

const putLight = async (lightId, category, title, date, place, people_cnt, description, time) => {
  try {
    const data = await lightDao.putLight(lightId, category,title, date, place
      , people_cnt, description, time);
    return data;
  } catch (error) {
    console.log('putLight에서 error 발생'+ error);
  }
}
const postEnterLight = async (lightId, memberId) => {
  try {
    await lightUserDao.postEnterLight(lightId, memberId);
  } catch (error) {
    console.log('postEnterLight error 발생'+ error);
  }
}
const deleteCancelLight = async (lightId, memberId) => {
  try {
    await lightUserDao.deleteCancelLight(lightId, memberId);
  } catch (error) {
    console.log('deleteCancelLight error 발생'+ error);
  }
}
const getEnterLightMember = async (lightId, memberId) => {
  try {
    const data = await lightUserDao.getEnterLightMember(lightId, memberId);
    return data
  } catch (error) {
    console.log('getEnterLightMember error 발생'+ error);
  }
}
const deleteLight = async (lightId, organizerId) => {
  try {
    await lightDao.deleteLight(lightId, organizerId);
  } catch (error) {
    console.log('deleteCancelLight error 발생'+ error);
  }
}
const getOranizerLight = async (organizerId) => {
  //to do 현재인원 보내기주기
  try {
    const result = await lightDao.getOranizerLight(organizerId);
    const data = result.map(light => ({
        light_id : light.id,
        title: light.title,
        date: dayjs(light.date).format('YYYY-MM-DD'),
        time: light.time.slice(0,-3),
        people_cnt: light.peopleCnt,
        place: light.place,
    }))

    return data;
  } catch (error) {
    console.log('getOranizerLight error 발생'+ error);
  }
}


module.exports = {
    addLight,
    putLight,
    postEnterLight,
    deleteCancelLight,
    getEnterLightMember,
    deleteLight,
    getOranizerLight
};
