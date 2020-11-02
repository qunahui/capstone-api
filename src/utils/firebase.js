const admin = require("firebase-admin");
const serviceAccount = require("../../admin-b2834-firebase-adminsdk-wv5ci-b54987cffd.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://admin-b2834.firebaseio.com"
});

export default admin