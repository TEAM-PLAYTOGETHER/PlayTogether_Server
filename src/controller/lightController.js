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


  } catch (error) {
    console.log(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

module.exports = {
    addLight,
};
