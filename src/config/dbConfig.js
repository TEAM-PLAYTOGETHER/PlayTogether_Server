const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DB_DEV,
    password: process.env.DB_PASSWORD,
  },
  production: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    // database: process.env.DB_DB_PROD,
    database: process.env.DB_DB_DEV,
    password: process.env.DB_PASSWORD,
  },
};
