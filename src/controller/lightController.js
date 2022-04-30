const { lightService } = require('../service');

const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const addLight = async (req, res) => {

  const { organizerId, crewId } = req.params;
  const image = req.file.location;
  const { category, title, date, time, description, place, people_cnt } = req.body;

  try {
    const result = await lightService.addLight(category, title, date, place,
       people_cnt, description, image,organizerId, crewId, time);
    return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.LIGHT_ADD_SUCCESS, result));
  } catch (error) {
    console.log('addLight Controller 에러: '+ error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const putLight = async (req, res) => {
  const { lightId } = req.params;
  const { category, title, date, place, people_cnt, description, time  } = req.body;
  
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const updatedPost = await lightService.putLight(lightId, category, title, date, place,
      people_cnt, description, time);

    if (!updatedPost) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_POST));
      
    return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.LIGHT_PUT_SUCCESS));
  } catch (error) {
    console.log('putLight Controller 에러: '+ error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const postEnterLight = async (req, res) => {
  const { lightId, memberId } = req.params;
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    const existedEnter = await lightService.getEnterLightMember(lightId, memberId);
    if(existedEnter) {
      await lightService.deleteCancelLight(lightId, memberId);
      return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.LIGHT_CANCEL_SUCCESS));    
    }
    await lightService.postEnterLight(lightId, memberId);
    
    return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.LIGHT_ENTER_SUCCESS));    
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};
const deleteLight = async (req, res) => {
  const { lightId, organizerId } = req.params;
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    await lightService.deleteLight(lightId, organizerId);
    
    return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.LIGHT_DELETE_SUCCESS));    
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  }
};




module.exports = {
    addLight,
    putLight,
    postEnterLight,
    deleteLight

};
