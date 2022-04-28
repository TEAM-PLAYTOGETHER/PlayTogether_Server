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


module.exports = {
    addLight,
};
