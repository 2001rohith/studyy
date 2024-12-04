const admin = require('firebase-admin');
const serviceAccount = require('./studyy-project-firebase-adminsdk-grwjo-576cf49b97.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
