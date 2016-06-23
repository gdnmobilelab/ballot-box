var express = require('express');
var router = express.Router();
var config = require('../config');
var Promise = require('bluebird');
var webpush = require('web-push');
var db = require('mysql-promise')();
var _ = require('lodash');
var numeral = require('numeral');
var AWS = require('aws-sdk');

var sns = new AWS.SNS({
    region: config.sns.region
});

db.configure(config.db.ballot);

webpush.setGCMAPIKey(config.gcm_api_key);

var response = function(status) {
    return function(res, msg) {
        res.status(status);
        res.send({message: msg});
    }
};

var OK = response(200);
var BAD_REQUEST = response(400);
var INTERNAL_SERVER_ERROR = response(500);

/**
 * Formats pull results (poll answer + num votes + newline)
 * @param pollResults
 * @param pollInfo
 * @returns {string}
 */
function formatResultsBody(pollResults) {
    var total = countPollResults(pollResults);
    var resultsBody = '';

    resultsBody += pollResults.map((result) => {
        var res;
        //Account for divide by zero
        if (total === 0) {
            res = `${result.answer_name}: 0%`
        } else {
            res = `${result.answer_name}: ${Math.round((result.votes / total) * 100)}%`
        }

        return res;
    }).join(" • ");

    resultsBody += '\n';
    resultsBody += 'Vote Total: ' + numeral(total).format('0,0');

    return resultsBody;
}

function countPollResults(pollResults) {
    return pollResults.reduce((coll, result) => {
        return coll + result.votes;
    }, 0);
}

/**
 * Adding results to a poll taken or poll not taken response are optional.
 * To add results, add <%= results %> to the response body in the poll_taken_results
 * or poll_not_taken_results columns in the `polls` db.
 * @param results
 * @param resp
 */
function templateResponse(results, resp) {
    var response = JSON.parse(resp);
    var body = response[0].options.options.body;
    body = template({'results': results}, body);
    response[0].options.options.body = body;

    return response;
}

//In case we get rid of lodash one day, wrapping it
var template = function(vars, str) {
    var temp = _.template(str);
    return temp(vars);
};

//Push a payload to a user
function pushToUser(user, payload) {
    return webpush.sendNotification(user.subscription.endpoint, {
        payload: payload,
        TTL: 60,
        userPublicKey: user.subscription.keys.p256dh,
        userAuth: user.subscription.keys.auth
    });
}

function isThreshold(total, thresholds) {
    var is = thresholds.find(function(th) {
        return th.threshold === total;
    });

    return is;
}

/**
 * req [object] - request with user's subscription information
 *
 * A user can post their subscription information to this endpoint
 * to get notified about the current poll results.
 */
router.post('/:pollId/results', function(req, res, next) {
   db.query('call p_GetPollWithResults(?)', [req.params.pollId])
       .then(function(results) {
           //p_GetPollResults has two result sets
           //Result Set 1: Contains the results of the poll (answers and vote counts)
           //Result Set 2: Contains information about the poll (name, question, responses)
           var pollResults = results[0][0];
           var pollInfo = results[0][1][0];

           return pushToUser(req.body.user, JSON.stringify(templateResponse(formatResultsBody(pollResults), pollInfo.poll_not_taken_response)));
       })
       .then(function(result) {
           return OK(res, 'Results sent.');
       }, function(err) {
           console.error(err);
           return BAD_REQUEST(res, 'Couldn\'t fetch poll results' );
       })
       .error(function(error) {
           console.error(err);
           return INTERNAL_SERVER_ERROR(res, error.message);
       });
});

router.post('/:pollId/vote', function(req, res, next) {
    //Cast vote requires the poll id, the external user id, the user's subscription and the user's answer
    db.query('call p_CastVote(?, ?, ?, ?)', [req.params.pollId, req.body.user.id, JSON.stringify(req.body.user.subscription), req.body.answerId])
        .then(function(results) {
            //p_CastVote has two result sets
            //Result Set 1: Contains the results of the poll (answers and vote counts)
            //Result Set 2: Contains information about the poll (name, question, responses)
            var pollResults = results[0][0];
            var pollInfo = results[0][1][0];
            var pollThresholds = results[0][2];
            var total = countPollResults(pollResults);

            var response = JSON.stringify(templateResponse(formatResultsBody(pollResults), pollInfo.poll_taken_response));
            var threshold = isThreshold(total, pollThresholds);

            var shouldSendSNS = typeof threshold !== 'undefined' && !pollInfo.poll_is_closed;
            //If we've hit a threshold and our poll is still open
            if (shouldSendSNS) {
                console.log('Sending to topic:', pollInfo.poll_sns_topic);
                sns.publish({
                    TopicArn: pollInfo.poll_sns_topic,
                    Message: response
                });
                db.query('call p_LockThreshold(?)', [threshold.id]);
            }

            return pushToUser(req.body.user, response);
        }, function(err) {
            console.log(err);
            return Promise.reject();
        })
        .then(function(result) {
            return OK(res, 'Vote cast!');
        }, function(err) {
            db.query('call p_GetPollWithResults(?)', [req.params.pollId])
                .then(function(results) {
                    var pollResults = results[0][0];
                    var pollInfo = results[0][1][0];

                    pushToUser(req.body.user, JSON.stringify(templateResponse(formatResultsBody(pollResults), pollInfo.poll_not_taken_response)));
                    return OK(res, 'You already voted, fetching results');
                }, function(err) {
                    console.error(err);
                    return BAD_REQUEST(res, 'There was a problem fetching results');
                });
        })
        .error(function(error) {
            console.error(err);
            return INTERNAL_SERVER_ERROR(res, error.message);
        });
      
});

module.exports = router;
