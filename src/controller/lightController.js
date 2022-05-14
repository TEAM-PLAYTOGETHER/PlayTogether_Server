const { lightService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const addLight = async (req, res) => {
  const organizerId = req.user.id;
  const { crewId } = req.params;
  let image = null;
  if (req.file) {
    image = req.file.location;
  }
  const { category, title, date, time, description, place, people_cnt } = req.body;

  // 번개 내용 미입력 시 에러
  if (!category || !title || !date || !time || !description || !place || !people_cnt) {
    return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }
  if (!crewId) {
    return res.status(statusCode.BAD_REQUEST).json(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CREW));
  }
  try {
    const result = await lightService.addLight(category, title, date, place, people_cnt, description, image, organizerId, crewId, time);

    return res.status(result.status).json(result);
  } catch (error) {
    console.log('addLight Controller 에러: ' + error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const putLight = async (req, res) => {
  const organizerId = req.user.id;
  const { lightId } = req.params;
  const { category, title, date, place, people_cnt, description, time } = req.body;

  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  // 카테고리가 먹을래, 갈래, 할래가 아니면 오류.
  if (!(category == '먹을래' || category == '갈래' || category == '할래')) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_CATEGORY));
  }
  try {
    const updatedPost = await lightService.putLight(lightId, organizerId, category, title, date, place, people_cnt, description, time);

    if (!updatedPost) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_POST));

    return res.status(updatedPost.status).json(updatedPost);
  } catch (error) {
    console.log('putLight Controller 에러: ' + error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const postEnterLight = async (req, res) => {
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
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const deleteLight = async (req, res) => {
  const organizerId = req.user.id;
  const { lightId } = req.params;
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const result = await lightService.deleteLight(lightId, organizerId);
    return res.status(result.status).json(result);
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const getOrganizerLight = async (req, res) => {
  const organizerId = req.user.id;
  if (!organizerId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const lights = await lightService.getOrganizerLight(organizerId);

    return res.status(lights.status).json(lights);
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const getEnterLight = async (req, res) => {
  const memberId = req.user.id;
  if (!memberId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const lights = await lightService.getEnterLight(memberId);

    return res.status(lights.status).json(lights);
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const getScrapLight = async (req, res) => {
  const memberId = req.user.id;
  if (!memberId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const lights = await lightService.getScrapLight(memberId);

    return res.status(lights.status).json(lights);
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const getCategoryLight = async (req, res) => {
  const category = req.query.category;
  const sort = req.query.sort;
  // 카테고리가 먹을래, 갈래, 할래가 아니면 오류.
  if (!(category == '먹을래' || category == '갈래' || category == '할래')) {
    return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_CATEGORY));
  }
  if (!(sort == 'createdAt' || sort == 'peopleCnt')) {
    return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.OUT_OF_VALUE));
  }
  try {
    const lights = await lightService.getCategoryLight(category, sort);
    return res.status(lights.status).json(lights);
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const getLightDetail = async (req, res) => {
  const { lightId } = req.params;
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const lights = await lightService.getLightDetail(lightId);

    return res.status(lights.status).json(lights);
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
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
};
