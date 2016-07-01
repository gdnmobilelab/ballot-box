var PollDAO = require('../dao/PollDAO');
var _ = require('lodash');

var PollService = {    
    vote: function(pollId, answerId, user) {
        return PollDAO.castVote(pollId, answerId, user)
            .then((vote) => {
                var total = tallyVotes(vote.results);
                return _.merge({}, vote, {
                    poll: _.merge({}, vote.poll, {total: total}),
                    threshold: isThreshold(total, vote.thresholds)
                });
            })
    },

    getPollAndResults: function(pollId, user) {
        return PollDAO.getPollWithResults(pollId)
            .then((res) => {
                var total = tallyVotes(res.results);
                return _.merge({}, res, {
                    poll: _.merge({}, res.poll, {total: total})
                })
            });
    },

    getPollAndAnswers: function(pollId) {
        return PollDAO.getPollWithAnswers(pollId)
            .then(function(p) {
                //No poll
                if (!p.poll) {
                    return Promise.reject();
                } else {
                    return p;
                }
            })
    },

    lockThreshold: function(threshold) {
        return PollDAO.lockThreshold(threshold.id);
    }
};

function isThreshold(total, thresholds) {
    return thresholds.find(function(th) {
        return th.threshold === total;
    });
}

function tallyVotes(answers) {
    return answers.reduce((coll, result) => {
        return coll + result.votes;
    }, 0);
}

module.exports = PollService;