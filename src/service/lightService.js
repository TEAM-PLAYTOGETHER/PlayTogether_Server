const { lightDao, lightUserDao, userDao, crewDao } = require('../db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const db = require('../loaders/db');
const dayjs = require('dayjs');
const { calculateAge } = require('../lib/calculateAge');
const { applyKoreanTime } = require('../lib/applyKoreanTime');
const pageNation = require('../lib/pageNation');

const addLight = async (category, title, date, place, people_cnt, description, image, organizerId, crewId, time) => {
  let client;

  const log = `lightService.addLight | category = ${category}, title = ${title}, date = ${date}, place = ${place}
  , people_cnt = ${people_cnt}, description = ${description}, image = ${image}, organizerId = ${organizerId},
  , crewId = ${crewId}, time = ${time}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 번개 생성하려고 하는 사람이 존재하는 사람인지를 검사.
    const exist = await userDao.getUserById(client, organizerId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }

    // 존재 하는 동아리인지 검사
    const existCrew = await crewDao.getExistCrew(client, crewId);
    if (!existCrew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    const data = await lightDao.addLight(client, category, title, date, place, people_cnt, description, image, organizerId, crewId, time);
    const result = [data];
    const data_result = result.map((o) => ({
      id: Number(o.id),
      category: o.category,
      title: o.title,
      date: o.date,
      place: o.place,
      peopleCnt: o.peopleCnt,
      description: o.description,
      image: o.image,
      isDeleted: o.isDeleted,
      createdAt: applyKoreanTime(o.createdAt),
      updatedAt: applyKoreanTime(o.updatedAt),
      organizerId: Number(o.organizerId),
      crewId: Number(o.crewId),
      time: o.time,
    }));

    // 번개 생성 후 번개 소유자도 번개에 참여시키기
    await lightDao.addLightOrganizer(client, organizerId);
    await client.query('COMMIT');

    return util.success(statusCode.OK, responseMessage.LIGHT_ADD_SUCCESS, data_result);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService addLight에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};

const putLight = async (lightId, organizerId, image, category, title, date, place, people_cnt, description, time) => {
  let client;

  const log = `lightService.putLight | lightId = ${lightId}, title = ${title}, date = ${date}, place = ${place}
  , people_cnt = ${people_cnt}, description = ${description}, organizerId = ${organizerId},time = ${time}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(client, lightId);
    if (!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(client, organizerId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    // 번개 수정하려는 사람이 organizer인지 검사
    const organizer = await lightDao.getLightOrganizerById(client, lightId, organizerId);
    if (!organizer) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_LIGHT_ORGANIZER);
    }
    const imagePath = await lightDao.getLightImage(client, lightId);
    const imageCnt = imagePath.image.length;

    if (imageCnt >= 3) {
      const data = await lightDao.putLightWhereImageFull(client, lightId, organizerId, image, category, title, date, place, people_cnt, description, time);
      const result = [data];
      const data_result = result.map((o) => ({
      id: Number(o.id),
      category: o.category,
      title: o.title,
      date: o.date,
      place: o.place,
      peopleCnt: o.peopleCnt,
      description: o.description,
      image: o.image,
      isDeleted: o.isDeleted,
      createdAt: applyKoreanTime(o.createdAt),
      updatedAt: applyKoreanTime(o.updatedAt),
      organizerId: Number(o.organizerId),
      crewId: Number(o.crewId),
      time: o.time,
    }));

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_PUT_SUCCESS, data_result);
    } else if(1 < imageCnt < 3){
      for (let i = 0; i < image.length; i++) {
        let imagePathString = image[i].toString();
        await lightDao.addLightImage(client,i + 2, imagePathString, lightId);
      }
      const data = await lightDao.putLightWhereImageNotFull(client, lightId, organizerId, category, title, date, place, people_cnt, description, time);
      const result = [data];
      const imageData = await lightDao.getLightImage(client, lightId);
      const data_result = result.map((o) => ({
        id: Number(o.id),
        category: o.category,
        title: o.title,
        date: o.date,
        place: o.place,
        peopleCnt: o.peopleCnt,
        imageData,
        description: o.description,
        isDeleted: o.isDeleted,
        createdAt: applyKoreanTime(o.createdAt),
        updatedAt: applyKoreanTime(o.updatedAt),
        organizerId: Number(o.organizerId),
        crewId: Number(o.crewId),
        time: o.time,
      }));
      await client.query('COMMIT');
      return util.success(statusCode.OK, responseMessage.LIGHT_PUT_SUCCESS, data_result);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService putLight에서 error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const postEnterLight = async (lightId, memberId) => {
  let client;

  const log = `lightService.postEnterLight | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(client, lightId);
    if (!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(client, memberId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    await lightUserDao.postEnterLight(client, lightId, memberId);

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_ENTER_SUCCESS);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService postEnterLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const deleteCancelLight = async (lightId, memberId) => {
  let client;

  const log = `lightService.deleteCancelLight | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');
    // 번개에 참여한 유저인지 검사

    const enterLightMember = await lightUserDao.getEnterLightMember(client, lightId, memberId);
    if (!enterLightMember) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT_MEMBER);
    }
    await lightUserDao.deleteCancelLight(client, lightId, memberId);

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_CANCEL_SUCCESS);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService deleteCancelLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getEnterLightMember = async (lightId, memberId) => {
  let client;

  const log = `lightService.getEnterLightMember | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    const data = await lightUserDao.getEnterLightMember(client, lightId, memberId);
    return data;
  } catch (error) {
    throw new Error('lightService getEnterLightMember error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const deleteLight = async (lightId, organizerId) => {
  let client;

  const log = `lightService.deleteLight | lightId = ${lightId}, organizerId = ${organizerId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');
    // 번개 삭제하려는 사람이 organizer인지 검사
    const organizer = await lightDao.getLightOrganizerById(client, lightId, organizerId);
    if (!organizer) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_LIGHT_ORGANIZER);
    }
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(client, lightId);
    if (!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    // 번개 삭제를 하려면 그 번개에 속해있는 사람 전부 제거.
    await lightUserDao.deleteLightUser(client, lightId);
    await lightDao.deleteLight(client, lightId, organizerId);

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_DELETE_SUCCESS);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService deleteLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getOrganizerLight = async (organizerId, crewId, offset, limit) => {
  let client;

  const log = `lightService.getOrganizerLight | organizerId = ${organizerId}, crewId = ${crewId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');
    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(client, organizerId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    // 존재 하는 동아리인지 검사
    const existCrew = await crewDao.getExistCrew(client, crewId);
    if (!existCrew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    const result = await lightDao.getOrganizerLight(client, organizerId, crewId, offset, limit);

    const totalCount = result.length;
    const totalPage = pageNation.getTotalPage(totalCount, limit);

    const lightData = result.map((light) => {
      const is_opened = light.joinCnt >= light.peopleCnt || light.date < new Date() ? false : true;
      const time = light.time == null ? null : light.time.slice(0, -3);
      const date = light.date == null ? null : dayjs(light.date).format('YYYY-MM-DD');
      const place = light.place == null ? null : light.place;
      const people_cnt = light.peopleCnt == null ? null : light.peopleCnt;
      return {
        light_id: Number(light.id),
        title: light.title,
        category: light.category,
        scp_cnt: Number(light.scpCnt),
        date,
        time,
        people_cnt,
        place,
        LightMemberCnt: Number(light.joinCnt),
        is_opened,
      };
    });

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_GET_ORGANIZER_SUCCESS, { lightData, offset, limit, totalCount, totalPage });
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService getOrganizerLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getEnterLight = async (memberId, crewId, offset, limit) => {
  let client;

  const log = `lightService.getEnterLight | memberId = ${memberId}, crewId = ${crewId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(client, memberId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    
    // 존재 하는 동아리인지 검사
    const existCrew = await crewDao.getExistCrew(client, crewId);
    if (!existCrew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    const result = await lightDao.getEnterLight(client, memberId, crewId, offset, limit);

    const totalCount = result.length;
    const totalPage = pageNation.getTotalPage(totalCount, limit);

    const lightData = result.map((light) => {
      const is_opened = light.joinCnt >= light.peopleCnt || light.date < new Date() ? false : true;
      const time = light.time == null ? null : light.time.slice(0, -3);
      const date = light.date == null ? null : dayjs(light.date).format('YYYY-MM-DD');
      const place = light.place == null ? null : light.place;
      const people_cnt = light.peopleCnt == null ? null : light.peopleCnt;
      return {
        light_id: Number(light.id),
        title: light.title,
        category: light.category,
        scp_cnt: Number(light.scpCnt),
        date,
        time,
        people_cnt,
        place,
        LightMemberCnt: Number(light.joinCnt),
        is_opened,
      };
    });

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_GET_ENTER_SUCCESS, { lightData, offset, limit, totalCount, totalPage });
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService getEnterLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getScrapLight = async (memberId, crewId, offset, limit) => {
  let client;

  const log = `lightService.getScrapLight | memberId = ${memberId}, crewId = ${crewId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(client, memberId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    // 존재 하는 동아리인지 검사
    const existCrew = await crewDao.getExistCrew(client, crewId);
    if (!existCrew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    const result = await lightDao.getScrapLight(client, memberId,crewId, offset, limit);

    const totalCount = result.length;
    const totalPage = pageNation.getTotalPage(totalCount, limit);

    const lightData = result.map((light) => {
      const is_opened = light.joinCnt >= light.peopleCnt || light.date < new Date() ? false : true;
      const time = light.time == null ? null : light.time.slice(0, -3);
      const date = light.date == null ? null : dayjs(light.date).format('YYYY-MM-DD');
      const place = light.place == null ? null : light.place;
      const people_cnt = light.peopleCnt == null ? null : light.peopleCnt;
      return {
        light_id: Number(light.id),
        title: light.title,
        category: light.category,
        scp_cnt: Number(light.scpCnt),
        date,
        time,
        people_cnt,
        place,
        LightMemberCnt: Number(light.joinCnt),
        is_opened,
      };
    });
    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_GET_SCRAP_SUCCESS, { lightData, offset, limit, totalCount, totalPage });
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService getScrapLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getCategoryLight = async (crewId, category, sort, offset, limit) => {
  let client;

  const log = `lightService.getCategoryLight | category = ${category}, sort = ${sort}, crewId = ${crewId}`;
  // 카테고리가 없으면 없는 번개
  if (!category) {
    return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
  }
  
  try {
    client = await db.connect(log);
    // 존재 하는 동아리인지 검사
    const existCrew = await crewDao.getExistCrew(client, crewId);
    if (!existCrew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    const result = await lightDao.getCategoryLight(client,crewId, category, sort, offset, limit);

    const totalCount = result.length;
    const totalPage = pageNation.getTotalPage(totalCount, limit);

    const lightData = result.map((light) => {
      const is_opened = light.joinCnt >= light.peopleCnt || light.date < new Date() ? false : true;
      const time = light.time == null ? null : light.time.slice(0, -3);
      const date = light.date == null ? null : dayjs(light.date).format('YYYY-MM-DD');
      const place = light.place == null ? null : light.place;
      const people_cnt = light.peopleCnt == null ? null : light.peopleCnt;
      return {
        light_id: Number(light.id),
        title: light.title,
        category: light.category,
        scp_cnt: Number(light.scpCnt),
        date,
        time,
        people_cnt,
        place,
        LightMemberCnt: Number(light.joinCnt),
        is_opened,
      };
    });

    return util.success(statusCode.OK, responseMessage.LIGHT_GET_CATEGORY_SUCCESS, { lightData, offset, limit, totalCount, totalPage });
  } catch (error) {
    throw new Error('lightService getCategoryLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getLightDetail = async (lightId) => {
  let client;

  const log = `lightService.getLightDetail | lightId = ${lightId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(client, lightId);
    if (!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    const result = await lightDao.getLightDetail(client, lightId);
    const members = await lightDao.getLightDetailMember(client, lightId);
    const organizer = await lightDao.getLightDetailOrganizer(client, lightId);

    const data2 = members.map((o) => ({
      user_id: Number(o.id),
      gender: o.gender,
      name: o.name,
      age: Number(calculateAge(dayjs(o.birthDay).format('YYYY-MM-DD'))),
    }));

    const data3 = organizer.map((o) => ({
      organizer_id: Number(o.id),
      name: o.name,
    }));

    const lightData = result.map((light) => {
      const is_opened = light.joinCnt >= light.peopleCnt || light.date < new Date() ? false : true;
      const time = light.time == null ? null : light.time.slice(0, -3);
      const date = light.date == null ? null : dayjs(light.date).format('YYYY-MM-DD');
      const place = light.place == null ? null : light.place;
      const people_cnt = light.peopleCnt == null ? null : light.peopleCnt;
      return {
        light_id: Number(light.id),
        category: light.category,
        title: light.title,
        scp_cnt: Number(light.scpCnt),
        date,
        time,
        description: light.description,
        image: light.image,
        people_cnt,
        place,
        LightMemberCnt: Number(light.joinCnt),
        is_opened,
        members: data2,
        organizer: data3,
      };
    });

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_GET_DETAIL_SUCCESS, lightData);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService getLightDetail error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getNewLight = async (memberId, crewId) => {
  let client;

  const log = `lightService.getNewLight | memberId = ${memberId} crewId = ${crewId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(client, memberId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    // 존재 하는 동아리인지 검사
    const existCrew = await crewDao.getExistCrew(client, crewId);
    if (!existCrew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    const result = await lightDao.getNewLight(client, crewId);

    const lightData = result.map((light) => {
      const is_opened = light.joinCnt >= light.peopleCnt || light.date < new Date() ? false : true;
      const time = light.time == null ? null : light.time.slice(0, -3);
      const date = light.date == null ? null : dayjs(light.date).format('YYYY-MM-DD');
      const place = light.place == null ? null : light.place;
      const people_cnt = light.peopleCnt == null ? null : light.peopleCnt;
      return {
        light_id: Number(light.id),
        title: light.title,
        category: light.category,
        scp_cnt: Number(light.scpCnt),
        date,
        time,
        people_cnt,
        place,
        LightMemberCnt: Number(light.joinCnt),
        is_opened,
      };
    });

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_GET_NEW_SUCCESS, lightData);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService getNewLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getHotLight = async (memberId, crewId) => {
  let client;

  const log = `lightService.getHotLight | memberId = ${memberId}, crewId = ${crewId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(client, memberId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    // 존재 하는 동아리인지 검사
    const existCrew = await crewDao.getExistCrew(client, crewId);
    if (!existCrew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    const result = await lightDao.getHotLight(client, crewId);

    const lightData = result.map((light) => {
      const is_opened = light.joinCnt >= light.peopleCnt || light.date < new Date() ? false : true;
      const time = light.time == null ? null : light.time.slice(0, -3);
      const date = light.date == null ? null : dayjs(light.date).format('YYYY-MM-DD');
      const place = light.place == null ? null : light.place;
      const people_cnt = light.peopleCnt == null ? null : light.peopleCnt;
      return {
        light_id: Number(light.id),
        title: light.title,
        category: light.category,
        scp_cnt: Number(light.scpCnt),
        date,
        time,
        people_cnt,
        place,
        LightMemberCnt: Number(light.joinCnt),
        is_opened,
      };
    });

    await client.query('COMMIT');
    return util.success(statusCode.OK, responseMessage.LIGHT_GET_HOT_SUCCESS, lightData);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService getHotLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const getSearchLight = async (memberId, crewId, search, category, offset, limit) => {
  let client;

  const log = `lightService.getSearchLight | memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    await client.query('BEGIN');

    // 존재하는 유저인지 확인
    const exist = await userDao.getUserById(client, memberId);
    if (!exist) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    // 존재 하는 동아리인지 검사
    const existCrew = await crewDao.getExistCrew(client, crewId);
    if (!existCrew) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW);
    }

    if (category) {
      const result = await lightDao.getSearchLightUseCategory(client, search, crewId,  category, offset, limit);

      const totalCount = result.length;
      const totalPage = pageNation.getTotalPage(totalCount, limit);

      const lightData = result.map((light) => {
        const is_opened = light.joinCnt >= light.peopleCnt || light.date < new Date() ? false : true;
        const time = light.time == null ? null : light.time.slice(0, -3);
        const date = light.date == null ? null : dayjs(light.date).format('YYYY-MM-DD');
        const place = light.place == null ? null : light.place;
        const people_cnt = light.peopleCnt == null ? null : light.peopleCnt;
        return {
          light_id: Number(light.id),
          title: light.title,
          category: light.category,
          scp_cnt: Number(light.scpCnt),
          date,
          time,
          people_cnt,
          place,
          LightMemberCnt: Number(light.joinCnt),
          is_opened,
        };
      });

      await client.query('COMMIT');
      return util.success(statusCode.OK, responseMessage.LIGHT_GET_SEARCH_SUCCESS, { lightData, offset, limit, totalCount, totalPage });
    }
    if (!category) {
      const result = await lightDao.getSearchLightNotCategory(client, search, crewId, offset, limit);

      const totalCount = result.length;
      const totalPage = pageNation.getTotalPage(totalCount, limit);

      const lightData = result.map((light) => {
        const is_opened = light.joinCnt >= light.peopleCnt || light.date < new Date() ? false : true;
        const time = light.time == null ? null : light.time.slice(0, -3);
        const date = light.date == null ? null : dayjs(light.date).format('YYYY-MM-DD');
        const place = light.place == null ? null : light.place;
        const people_cnt = light.peopleCnt == null ? null : light.peopleCnt;
        return {
          light_id: Number(light.id),
          title: light.title,
          category: light.category,
          scp_cnt: Number(light.scpCnt),
          date,
          time,
          people_cnt,
          place,
          LightMemberCnt: Number(light.joinCnt),
          is_opened,
        };
      });

      await client.query('COMMIT');
      return util.success(statusCode.OK, responseMessage.LIGHT_GET_SEARCH_SUCCESS, { lightData, offset, limit, totalCount, totalPage });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('lightService getSearchLight error 발생: \n' + error);
  } finally {
    client.release();
  }
};
const existLightUser = async (lightId, memberId) => {
  let client;

  const log = `lightService.existLightUser | lightId = ${lightId}, memberId = ${memberId}`;
  try {
    client = await db.connect(log);
    // 존재하는 유저인지 확인
    const existUser = await userDao.getUserById(client, memberId);
    if (!existUser) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_USER);
    }
    // 존재하는 번개인지 확인
    const existLight = await lightDao.getExistLight(client, lightId);
    if (!existLight) {
      return util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT);
    }
    // 본인이 그 번개의 소유자인지 확인
    const is_organizer = await lightDao.IsLightOrganizer(client, lightId, memberId);
    // 본인이 참여한 번개인지 확인
    const is_entered = await lightUserDao.existLightUser(client, lightId, memberId);
    if(is_entered && is_organizer){
      const is_organizer = true;
      const is_entered = true;
      return util.success(statusCode.OK, responseMessage.EXIST_LIGHT_USER, { is_entered, is_organizer });
    }
    if(!is_entered && !is_organizer){
      const is_organizer = false;
      const is_entered = false;
      return util.success(statusCode.OK, responseMessage.EXIST_NOT_LIGHT_USER, { is_entered, is_organizer });
    }
    if(is_entered && !is_organizer){
      const is_organizer = false;
      const is_entered = true;
      return util.success(statusCode.OK, responseMessage.EXIST_LIGHT_USER, { is_entered, is_organizer });
    }
    
  } catch (error) {
    throw new Error('lightService getEnterLightMember error 발생: \n' + error);
  } finally {
    client.release();
  }
};

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
  getLightDetail,
  getNewLight,
  getHotLight,
  getSearchLight,
  existLightUser,
};
