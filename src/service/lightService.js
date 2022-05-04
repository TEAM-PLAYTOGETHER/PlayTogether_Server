const { lightDao, lightUserDao, userDao, crewDao } = require('../db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const dayjs = require('dayjs');
const { calculateAge } = require('../lib/calculateAge');

const addLight = async (category, title, date, place, people_cnt, description, image, organizerId, crewId, time) => {
  try {
    // 번개 생성하려고 하는 사람이 존재하는 사람인지를 검사.
    const exist = await userDao.getUserById(organizerId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }

    // 존재 하는 동아리인지 검사
    const existCrew = await crewDao.getExistCrew(crewId);
    if(!existCrew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    const data = await lightDao.addLight(category, title, date, place
        , people_cnt, description,image, organizerId, crewId, time);

    return util.success(statusCode.OK, responseMessage.LIGHT_ADD_SUCCESS, data);
  } catch (error) {
    console.log('addLight에서 error 발생'+ error);
  }
};

const putLight = async (lightId, organizerId, category, title, date, place, people_cnt, description, time) => {
  try {
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(lightId);
    if(!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(organizerId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    // 번개 수정하려는 사람이 organizer인지 검사
    const organizer = await lightDao.getLightOrganizerById(organizerId);
    if (!organizer) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_LIGHT_ORGANIZER);
    }
    const data = await lightDao.putLight(lightId,organizerId,category,title, date, place
      , people_cnt, description, time);
    
      return util.success(statusCode.OK, responseMessage.LIGHT_PUT_SUCCESS, data);
  } catch (error) {
    console.log('putLight에서 error 발생'+ error);
  }
}
const postEnterLight = async (lightId, memberId) => {
  try {
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(lightId);
    if(!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(memberId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    await lightUserDao.postEnterLight(lightId, memberId);
    
    return util.success(statusCode.OK, responseMessage.LIGHT_ENTER_SUCCESS);
  } catch (error) {
    console.log('postEnterLight error 발생'+ error);
  }
}
const deleteCancelLight = async (lightId, memberId) => {
  try {
    // 번개에 참여한 유저인지 검사
    const enterLightMember = await lightUserDao.getEnterLightMember(lightId, memberId);
    if(!enterLightMember){
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT_MEMBER);
    }
    await lightUserDao.deleteCancelLight(lightId, memberId);
    
    return util.success(statusCode.OK, responseMessage.LIGHT_CANCEL_SUCCESS);
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
    // 번개 삭제하려는 사람이 organizer인지 검사
    const organizer = await lightDao.getLightOrganizerById(organizerId);
    if (!organizer) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_LIGHT_ORGANIZER);
    }
    await lightDao.deleteLight(lightId, organizerId);
    
    return util.success(statusCode.OK, responseMessage.LIGHT_DELETE_SUCCESS);
  } catch (error) {
    console.log('deleteCancelLight error 발생'+ error);
  }
}
const getOrganizerLight = async (organizerId) => {
  // 존재하는 유저인지 확인
  const exist = await userDao.getUserById(organizerId);
  if (!exist) {
    return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
  }
  try {
    const result = await lightDao.getOrganizerLight(organizerId);
    const data = result.map(light => ({
        light_id : light.id,
        title: light.title,
        date: dayjs(light.date).format('YYYY-MM-DD'),
        time: light.time.slice(0,-3),
        people_cnt: light.peopleCnt,
        place: light.place,
        LightMemberCnt: light.joinCnt
    }))

    return util.success(statusCode.OK, responseMessage.LIGHT_GET_ORGANIZER_SUCCESS, data);
  } catch (error) {
    console.log('getOrganizerLight error 발생'+ error);
  }
}
const getEnterLight = async (memberId) => {
  // 존재하는 유저인지 확인
  const exist = await userDao.getUserById(memberId);
  if (!exist) {
    return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
  }
  try {
    const result = await lightDao.getEnterLight(memberId);
    const data = result.map(light => ({
        light_id : light.id,
        title: light.title,
        date: dayjs(light.date).format('YYYY-MM-DD'),
        time: light.time.slice(0,-3),
        people_cnt: light.peopleCnt,
        place: light.place,
        LightMemberCnt: light.joinCnt
    }))

    return util.success(statusCode.OK, responseMessage.LIGHT_GET_ENTER_SUCCESS, data);
  } catch (error) {
    console.log('getEnterLight error 발생'+ error);
  }
}
const getScrapLight = async (memberId) => {
  // 존재하는 유저인지 확인
  const exist = await userDao.getUserById(memberId);
  if (!exist) {
    return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
  }
  try {
    const result = await lightDao.getScrapLight(memberId);
    const data = result.map(light => ({
        light_id : light.id,
        title: light.title,
        date: dayjs(light.date).format('YYYY-MM-DD'),
        time: light.time.slice(0,-3),
        people_cnt: light.peopleCnt,
        place: light.place,
        LightMemberCnt: light.joinCnt
    }))

    return util.success(statusCode.OK, responseMessage.LIGHT_GET_SCRAP_SUCCESS, data);
  } catch (error) {
    console.log('getScrapLight error 발생'+ error);
  }
}
const getCategoryLight = async (category, sort) => {
  // 카테고리가 없으면 없는 번개
  if(!category){
    return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
  }
// TODO: 번개 현재 인원 보내주기
  try {
    const result = await lightDao.getCategoryLight(category,sort);
    const data = result.map(light => ({
      light_id : light.id,
      category: light.category,
      title: light.title,
      date: dayjs(light.date).format('YYYY-MM-DD'),
      time: light.time.slice(0,-3),
      people_cnt: light.peopleCnt,
      place: light.place,
      LightMemberCnt: light.joinCnt
    }))

    return util.success(statusCode.OK, responseMessage.LIGHT_GET_CATEGORY_SUCCESS, data);
  } catch (error) {
    console.log('getCategoryLight error 발생'+ error);
  }
}
const getLightDetail = async (lightId) => {
   // 존재하는 번개인지 확인
   const existLight = await lightDao.getExistLight(lightId);
   if(!existLight) {
     return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
   }
// TODO: 번개 현재 인원 보내주기
  try {
    const result = await lightDao.getLightDetail(lightId);
    const members = await lightDao.getLightDetailMember(lightId);
    const organizer = await lightDao.getLightDetailOrganizer(lightId);
    
    const data2 = members.map(o => ({
      user_id: o.id,
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
        LightMemberCnt: light.joinCnt,
        members: data2,
        organizer: organizer
    }))

    return util.success(statusCode.OK, responseMessage.LIGHT_GET_DETAIL_SUCCESS, data);
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
    getOrganizerLight,
    getEnterLight,
    getScrapLight,
    getCategoryLight,
    getLightDetail
};
