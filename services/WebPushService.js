var config = require('../config');
var webpush = require('web-push');

webpush.setGCMAPIKey(config.gcm_api_key);

var WebPushService = {
    pushToUser: function (user, payload) {
        return webpush.sendNotification(user.subscription.endpoint, {
            payload: payload,
            TTL: 60,
            userPublicKey: user.subscription.keys.p256dh,
            userAuth: user.subscription.keys.auth
        }).catch((e) => {
            console.log('Error pushing to user: ', e);
        });
    }
};

module.exports = WebPushService;