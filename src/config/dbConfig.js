const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DB_DEV,
    password: process.env.DB_PASSWORD,
  },
  /* 
  // 추후에 배포 단계에서 다른 DB 사용할 것이라면 추가하기
  production: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DB_PROD,
    password: process.env.DB_PASSWORD,
  },
  */
};
