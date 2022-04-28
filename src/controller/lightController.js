const { lightService } = require('../service');

const db = require('../loaders/db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

const addLight = async (req, res) => {

  const { organizerId, crewId } = req.params;
  const image = req.file.location;
  const { category, title, date, time, description, place, people_cnt } = req.body;

  let client;

  try {
    client = await db.connect(req);

    const result = await lightService.addLight(client, category, title, date, place,
       people_cnt, description, image,organizerId, crewId, time);
       
    return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.LIGHT_ADD_SUCCESS, result));
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};


const putLight = async (req, res) => {
  const { lightId } = req.params;
  const { category, title, date, place, people_cnt, description, time  } = req.body;

  let client;
  
  if (!lightId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  try {
    client = await db.connect(req);
    const updatedPost = await lightService.putLight(client, lightId, category, title, date, place,
      people_cnt, description, time);

    if (!updatedPost) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_POST));
      
    return res.status(statusCode.OK).json(util.success(statusCode.OK, responseMessage.LIGHT_PUT_SUCCESS));
  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};



module.exports = {
    addLight,
    putLight
};
