var express = require('express');
var router = express.Router();
var config = require('../config');
var PollService = require('../services/PollService');
var PollResponseService = require('../services/PollResponseService');
var SNSService = require('../services/SNSService');
var WebPushService = require('../services/WebPushService');
var APIKeyFilter = require('../middleware/api-key-filter');
var Responses = require('./RouteResponses');
var OK = Responses.OK;
var BAD_REQUEST = Responses.BAD_REQUEST;


router.post('/:pollId/results', APIKeyFilter, function(req, res, next) {
    PollService.getPollAndResults(req.params.pollId)
        .then((res) => {
            SNSService.broadcast(PollResponseService.preparePollResponse(voted.response, voted.poll, voted.results))
        })
});

router.post('/:pollId/vote', APIKeyFilter, function(req, res, next) {
    PollService.vote(req.params.pollId, req.body.answerId, req.body.user)
        .then(function(voted) {
            //If there's a completed response to send, send it to the user
            if (voted.completedResponse) {
                WebPushService.pushToUser(req.body.user, PollResponseService.preparePollResponse(voted.completedResponse, voted.poll, voted.results));
            }

            //If there's an update response and we have a threshold, send it to erybody
            if (voted.updateResponse && voted.threshold) {
                PollService.lockThreshold(voted.threshold)
                    .then((alreadyLocked) => {
                        if (!alreadyLocked) {
                            SNSService.sendToTopic(PollResponseService.preparePollResponse(voted.updateResponse, voted.poll, voted.results), voted.poll.sns_topic);
                        }
                    })
            }

            return OK(res, 'You voted!');
        })
        .catch((err) => {
            BAD_REQUEST(res, err);
        });
});

router.get('/:pollId/chain', function(req, res, next) {
    PollService.getPollAndAnswers(req.params.pollId)
        .then((poll) => {
            return PollResponseService.prepareChainResponse(poll);
        })
        .then((chain) => {
            return OK(res, chain);
        })
        .catch((err) => {
            BAD_REQUEST(res, err);
        });
});

module.exports = router;
