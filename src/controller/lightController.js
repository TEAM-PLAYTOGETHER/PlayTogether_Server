const { lightService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const addLight = async (req, res, next) => {
  const organizerId = req.user.id;
  const { crewId } = req.params;
  let image = null;
  if (req.files) {
    image = req.files;
  }
  const path = image.map((img) => img.location);
  const { category, title, date, time, description, place, people_cnt } = req.body;

  // 번개 내용 미입력 시 에러
  if (!category || !title || !description) {
    return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  if (!crewId) {
    return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW));
  }
  try {
    const result = await lightService.addLight(category, title, date, place, people_cnt, description, path, organizerId, crewId, time);

    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('addLight Controller 에러: \n' + error));
  }
};
const putLight = async (req, res, next) => {
  const organizerId = req.user.id;
  const { lightId } = req.params;
  const { category, title, date, place, people_cnt, description, time } = req.body;

  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const updatedPost = await lightService.putLight(lightId, organizerId, category, title, date, place, people_cnt, description, time);

    // 카테고리가 먹을래, 갈래, 할래가 아니면 오류.
    // if (!(updatedPost.category == "먹을래") || !(updatedPost.category == "갈래") || !(updatedPost.category == "할래")) {
    //   return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CATEGORY));
    // }

    if (!updatedPost) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_POST));

    return res.status(updatedPost.status).json(updatedPost);
  } catch (error) {
    return next(new Error('putLight Controller 에러: \n' + error));
  }
};
const postEnterLight = async (req, res, next) => {
  const memberId = req.user.id;
  const { lightId } = req.params;
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const existedEnter = await lightService.getEnterLightMember(lightId, memberId);
    if (existedEnter) {
      const result = await lightService.deleteCancelLight(lightId, memberId);
      return res.status(result.status).json(result);
    }
    const result = await lightService.postEnterLight(lightId, memberId);

    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('postEnterLight Controller 에러: \n' + error));
  }
};
const deleteLight = async (req, res, next) => {
  const organizerId = req.user.id;
  const { lightId } = req.params;
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const result = await lightService.deleteLight(lightId, organizerId);
    return res.status(result.status).json(result);
  } catch (error) {
    return next(new Error('deleteLight Controller 에러: \n' + error));
  }
};
const getOrganizerLight = async (req, res, next) => {
  const organizerId = req.user.id;
  const { crewId } = req.params;
  var curpage = req.query.curpage || 1;
  var pageSize = req.query.pageSize || 5;

  let offset = (curpage - 1) * Number(pageSize);
  let limit = Number(pageSize);

  if (!organizerId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const lights = await lightService.getOrganizerLight(organizerId, crewId, offset, limit);

    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('getOrganizerLight Controller 에러: \n' + error));
  }
};
const getEnterLight = async (req, res, next) => {
  const memberId = req.user.id;
  const { crewId } = req.params;

  var curpage = req.query.curpage || 1;
  var pageSize = req.query.pageSize || 5;

  let offset = (curpage - 1) * Number(pageSize);
  let limit = Number(pageSize);

  if (!memberId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const lights = await lightService.getEnterLight(memberId, crewId, offset, limit);

    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('getEnterLight Controller 에러: \n' + error));
  }
};
const getScrapLight = async (req, res, next) => {
  const memberId = req.user.id;
  const { crewId } = req.params;

  var curpage = req.query.curpage || 1;
  var pageSize = req.query.pageSize || 5;

  let offset = (curpage - 1) * Number(pageSize);
  let limit = Number(pageSize);

  if (!memberId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const lights = await lightService.getScrapLight(memberId, crewId, offset, limit);

    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('getScrapLight Controller 에러: \n' + error));
  }
};
const getCategoryLight = async (req, res, next) => {
  const { crewId } = req.params;
  const category = req.query.category;
  const sort = req.query.sort;

  var curpage = req.query.curpage || 1;
  var pageSize = req.query.pageSize || 5;

  let offset = (curpage - 1) * Number(pageSize);
  let limit = Number(pageSize);

  // 카테고리가 먹을래, 갈래, 할래가 아니면 오류.
  if (!(category == '먹을래' || category == '갈래' || category == '할래')) {
    return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CATEGORY));
  }
  if (!(sort == 'createdAt' || sort == 'peopleCnt')) {
    return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_SORT_VALUE));
  }
  try {
    const lights = await lightService.getCategoryLight(crewId, category, sort, offset, limit);
    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('getCategoryLight Controller 에러: \n' + error));
  }
};
const getLightDetail = async (req, res, next) => {
  const { lightId } = req.params;

  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT));

  try {
    const lights = await lightService.getLightDetail(lightId);

    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('getLightDetail Controller 에러: \n' + error));
  }
};
const getNewLight = async (req, res, next) => {
  const memberId = req.user.id;
  const { crewId } = req.params;
  if (!memberId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const lights = await lightService.getNewLight(memberId, crewId);

    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('getNewLight Controller 에러: \n' + error));
  }
};
const getHotLight = async (req, res, next) => {
  const memberId = req.user.id;
  const { crewId } = req.params;
  if (!memberId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const lights = await lightService.getHotLight(memberId, crewId);

    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('getHotLight Controller 에러: \n' + error));
  }
};

const getSearchLight = async (req, res, next) => {
  const memberId = req.user.id;
  const { crewId } = req.params;
  const search = req.query.search;
  const category = req.query.category;

  var curpage = req.query.curpage || 1;
  var pageSize = req.query.pageSize || 5;

  let offset = (curpage - 1) * Number(pageSize);
  let limit = Number(pageSize);

  if (!memberId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  if (search.length < 2) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_TWO_SEARCH_QUERY));
  }
  try {
    const lights = await lightService.getSearchLight(memberId, crewId, search, category, offset, limit);

    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('getSearchLight Controller 에러: \n' + error));
  }
};
const ExistLightUser = async (req, res, next) => {
  const memberId = req.user.id;
  const { lightId } = req.params;

  if (!memberId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_LIGHT));

  try {
    const lights = await lightService.existLightUser(lightId, memberId);

    return res.status(lights.status).json(lights);
  } catch (error) {
    return next(new Error('existLightUser Controller 에러: \n' + error));
  }
};

module.exports = {
  addLight,
  putLight,
  postEnterLight,
  deleteLight,
  getOrganizerLight,
  getEnterLight,
  getScrapLight,
  getCategoryLight,
  getLightDetail,
  getNewLight,
  getHotLight,
  getSearchLight,
  ExistLightUser
};
