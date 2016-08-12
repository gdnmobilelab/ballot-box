var config = require('../config');
var db = require('mysql-promise')();

db.configure(config.db.ballot);

function getPollResponse(responseType) {
    return function(pollId) {
        return db.query('call p_GetPollResponse(?, ?)', [pollId, responseType])
            .then(function(results) {
                //p_GetPollResponse has three result sets
                //Result Set 1: The response
                //Result Set 2: the poll info
                //Result Set 3: the answers
                return {
                    response: results[0][0],
                    poll: results[0][1][0],
                    answers: results[0][2]
                };
            })
    }
}

var PollDAO = {
    /**
     *
     * @param pollId number
     * @param answerId number
     * @param user object
     */
    castVote: function(pollId, answerId, user) {
        return db.query('call p_CastVote(?, ?, ?, ?)', [pollId, answerId, user.id, JSON.stringify(user.subscription)])
            .then(function(results) {
                //p_CastVote has four result sets
                //Result Set 1: Contains the results of the poll (answers and vote counts)
                //Result Set 2: Contains information about the poll (name, question, responses)
                //Result Set 3: Contains the response template
                //Result Set 4: Contains information about the poll thresholds
                return {
                    poll: results[0][0][0],
                    results: results[0][1],
                    completedResponse: results[0][2][0],
                    updateResponse: results[0][3][0],
                    thresholds: results[0][4]
                };
            }).catch((e) => {
                var msg;
                
                switch (e.code) {
                    case 'ER_DUP_ENTRY':
                        msg = 'User has already voted.';
                    break;
                    default:
                        console.log(e);
                        msg = 'There was a problem with the request';
                }
                
                return Promise.reject({message: msg});
            });
    },

    getPollWithResults: function(pollId) {
        return db.query('call p_GetPollWithResults(?)', [pollId])
            .then(function(results) {
                //p_GetPollResults has two result sets
                //Result Set 1: Contains the results of the poll (answers and vote counts)
                //Result Set 2: Contains information about the poll (name, question, responses)

                var poll = results[0][1][0];

                poll.on_tap = poll.on_tap ? JSON.parse(poll.on_tap) : null;
                return {
                    results: results[0][0],
                    poll: results[0][1][0]
                };
            });
    },

    getPollCompletedResponse: getPollResponse('POLL_COMPLETED'),

    getPollSkippedResponse: getPollResponse('POLL_SKIPPED'),

    getPollUpdateResponse: getPollResponse('POLL_UPDATE'),

    getPollWithAnswers: function(pollId) {
        return db.query('call p_GetPollWithAnswers(?)', [pollId])
            .then(function(results) {
                var poll = results[0][0][0];

                poll.on_tap = poll.on_tap ? JSON.parse(poll.on_tap) : null;
                //p_GetPollWithAnswers has two result sets
                //Result Set 1: The poll
                //Result Set 2: The answers of the poll
                return {
                    poll: results[0][0][0],
                    answers: results[0][1]
                };
            })
    },
    
    lockThreshold: function(thresholdId, pollId) {
        return db.query('call p_LockThreshold(?, ?)', [thresholdId, pollId])
            .then(function(results) {
                return results[0][0][0].was_already_locked
            });
    }
    
};

module.exports = PollDAO;