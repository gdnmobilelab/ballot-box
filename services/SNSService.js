var config = require('../config');
var AWS = require('aws-sdk');

var sns = new AWS.SNS({
    region: config.sns.region
});

var SNSService = {
    broadcast: function(msg, topic) {
        return;
        
        var snsResponse = JSON.stringify({
            ttl: 60,
            payload: msg
        });

        console.log('SNS message:', snsResponse);

        return sns.publish({
            TopicArn: topic,
            Message: snsResponse
        }, function(err, data) {
            if (err) {
                console.log('Error sending to SNS: ', err, err.stack);
            } else {
                console.log('Sent notification to topic:',topic, data);
            }
        });
    }
};

module.exports = SNSService;