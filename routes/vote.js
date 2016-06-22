var express = require('express');
var router = express.Router();
var config = require('../config');
var Promise = require('bluebird');
var webpush = require('web-push');
var db = require('mysql-promise')();
var _ = require('lodash');

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
 * @returns {string}
 */
function formatResultsBody(pollResults) {
    var total = pollResults.reduce((coll, result) => {
        return coll + result.votes;
    }, 0);

    return pollResults.map((result) => {
        //Account for divide by zero
        if (total === 0) {
            return `${result.answer_name}: 0%`
        } else {
            return `${result.answer_name}: ${Math.round((result.votes / total) * 100)}%`
        }
    }).join("\n");
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

/**
 * req [object] - request with user's subscription information
 *
 * A user can post their subscription information to this endpoint
 * to get notified about the current poll results.
 */
router.post('/:pollId/results', function(req, res, next) {
   db.query('call p_GetPollResults(?)', [req.params.pollId])
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

            return pushToUser(req.body.user, JSON.stringify(templateResponse(formatResultsBody(pollResults), pollInfo.poll_taken_response)));
        }, function(err) {
            console.log(err);
            return Promise.reject();
        })
        .then(function(result) {
            return OK(res, 'Vote cast!');
        }, function(err) {
            console.error(err);
            return BAD_REQUEST(res, 'There was an issue with this request.' );
        })
        .error(function(error) {
            console.error(err);
            return INTERNAL_SERVER_ERROR(res, error.message);
        });
      
});

module.exports = router;
