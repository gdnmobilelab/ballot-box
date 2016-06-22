var request = require('request-promise');
var config = require('./../config');
var _ = require('lodash');


var initialOpts = {
    headers: {
        "X-api-key": config.pushy.apiKey
    },
    json: true
};

module.exports = {
    getSubscription: function(subscription) {
        var opts = _.merge({}, initialOpts, {
            method: 'POST',
            uri: config.pushy.api + '/get-subscriptions',
            body: {
                type: "web",
                data: subscription
            }
        });

        return request(opts);
    }
};