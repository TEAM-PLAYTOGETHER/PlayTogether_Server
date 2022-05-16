const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const hpp = require('hpp');
const helmet = require('helmet');
const config = require('./config');
dotenv.config();

const app = express();
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(hpp());
  app.use(helmet());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', require('./routes'));

app.use('*', (req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: '존재하지 않는 경로입니다.',
  });
});

const PORT = config.port;
const server = app
  .listen(PORT, () => {
    console.log(
      `
    
    ##############################################
    🛡️  Server listening on port: ${PORT} 🛡️
    ⚡️ Updated: 22.05.17              ⚡️
    ##############################################
  `,
    );
  })
  .on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

server.timeout = 1000000;
