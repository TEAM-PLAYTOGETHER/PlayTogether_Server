const { lightDao, lightUserDao } = require('../db');
const db = require('../loaders/db');
const dayjs = require('dayjs');
const { calculateAge } = require('../lib/calculateAge');

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
const getEnterLight = async (memberId) => {
  //to do 현재인원 보내기주기
  try {
    const result = await lightDao.getEnterLight(memberId);
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
    console.log('getEnterLight error 발생'+ error);
  }
}
const getScrapLight = async (memberId) => {
  //to do 현재인원 보내기주기
  try {
    const result = await lightDao.getScrapLight(memberId);
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
    console.log('getScrapLight error 발생'+ error);
  }
}
const getCategoryLight = async (category, sort) => {
  //to do 현재인원 보내기주기
  try {
    const result = await lightDao.getCategoryLight(category,sort);
    const data = result.map(light => ({
        light_id : light.id,
        category : light.category,
        title: light.title,
        date: dayjs(light.date).format('YYYY-MM-DD'),
        time: light.time.slice(0,-3),
        people_cnt: light.peopleCnt,
        place: light.place,
    }))

    return data;
  } catch (error) {
    console.log('getCategoryLight error 발생'+ error);
  }
}
const getLightDetail = async (lightId) => {
  //to do 현재인원 보내기주기
  try {
    const result = await lightDao.getLightDetail(lightId);
    const members = await lightDao.getLightDetailMember(lightId);
    const organizer = await lightDao.getLightDetailOrganizer(lightId);
    
    const data2 = members.map(o => ({
      mbti : o.mbti,
      gender: o.gender,
      name : o.name,
      age : Number(calculateAge(dayjs(o.birthDay).format('YYYY-MM-DD'))) + 1
  }))

    const data = result.map(light => ({
        light_id : light.id,
        category : light.category,
        title: light.title,
        date: dayjs(light.date).format('YYYY-MM-DD'),
        time: light.time.slice(0,-3),
        description: light.description,
        image: light.image,
        people_cnt: light.peopleCnt,
        place: light.place,
        members: data2,
        organizer: organizer
    }))

    return data;
  } catch (error) {
    console.log('getCategoryLight error 발생'+ error);
  }
}


module.exports = {
    addLight,
    putLight,
    postEnterLight,
    deleteCancelLight,
    getEnterLightMember,
    deleteLight,
    getOranizerLight,
    getEnterLight,
    getScrapLight,
    getCategoryLight,
    getLightDetail
};
