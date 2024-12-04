const admin = require('./firebaseAdmin');

const sendPushNotifications = async (tokens, title, body) => {
  try {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      tokens: tokens, 
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`${response.successCount} notifications sent successfully.`);
    return response;
  } catch (error) {
    console.error('Error sending push notifications:', error);
    throw error;
  }
};

module.exports = sendPushNotifications;
