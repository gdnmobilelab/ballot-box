
module.exports = {
    topicFromSNSARN: function(snsARN) {
        var snsARNsplit = snsARN.split(':');
        var topicWithEnv = snsARNsplit[snsARNsplit.length - 1];
        return topicWithEnv.substring(topicWithEnv.indexOf('__') + 2);
    }
};