const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

AWS.config.loadFromPath(__dirname + '/../config/s3.json');

const s3 = new AWS.S3();

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp'];

const imageUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'playtogether-s3',
    key: (req, file, callback) => {
      const extension = path.extname(file.originalname);
      if (!allowedExtensions.includes(extension)) {
        return callback(new Error('잘못된 파일입니다.'));
      }
	    console.log(file)
      callback(null, `${Date.now()}.${file.originalname.split('.').pop()}`);
    },
    acl: 'public-read-write',
  }),
});

module.exports = {
  imageUploader,
};
