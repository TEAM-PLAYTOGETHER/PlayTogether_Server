const admin = require('firebase-admin');
const serviceAccount = require('./play-together-66ddb-firebase-adminsdk-bx7fx-3d83e6876a.json');
const dotenv = require('dotenv');

dotenv.config();

let firebase;
if (admin.apps.length === 0) {
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  firebase = admin.app();
}

module.exports = {
  api: require('./routes'),
};
