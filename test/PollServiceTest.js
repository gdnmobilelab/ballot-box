var rewire = require("rewire");
var PollService = rewire("../services/PollService");
var PollDAO = require('../dao/PollDAO');
var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var mockVoteResult = {
    "poll": {
        "id": "a373bdb0-3fb7-11e6-8858-520e4f6405ee",
        "question": "What's your favorite animal?",
        "icon": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Welchcorgipembroke.JPG",
        "is_closed": 0,
        "tag": "favorite-animal",
        "sns_topic": "arn:aws:sns:us-east-1:348747012323:staging__favorite_animal",
        "next_question_text": "Next issue",
        "next_question_icon": "https://www.gdnmobilelab.com/data/primary-results/static-images/browser_icon_big.png",
        "created_on": "2016-07-01T18:14:23.000Z",
        "modified_on": "2016-07-01T18:14:23.000Z"
    },
    "results": [
        {
            "answer_name": "Dog",
            "votes": 1
        },
        {
            "answer_name": "Cat",
            "votes": 0
        },
        {
            "answer_name": "Other",
            "votes": 0
        }
    ],
    "thresholds": [
        {
            "threshold": 1,
            "poll_id": "a373bdb0-3fb7-11e6-8858-520e4f6405ee",
            "threshold_locked_on": null,
            "created_on": "2016-07-05T15:41:56.000Z"
        },
        {
            "threshold": 3,
            "poll_id": "a373bdb0-3fb7-11e6-8858-520e4f6405ee",
            "threshold_locked_on": null,
            "created_on": "2016-07-05T15:41:56.000Z"
        }
    ]
};

var mockPollAndAnswersResponse = {
    "poll": {
        "id": "a373bdb0-3fb7-11e6-8858-520e4f6405ee",
        "question": "What's your favorite animal?",
        "icon": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Welchcorgipembroke.JPG",
        "is_closed": 0,
        "tag": "favorite-animal",
        "sns_topic": "arn:aws:sns:us-east-1:348747012323:staging__favorite_animal",
        "next_question_text": "Next issue",
        "next_question_icon": "https://www.gdnmobilelab.com/data/primary-results/static-images/browser_icon_big.png",
        "created_on": "2016-07-01T18:14:23.000Z",
        "modified_on": "2016-07-01T18:14:23.000Z"
    },
    "answers": [
        {
            "answer_name": "Dog"
        },
        {
            "answer_name": "Cat"
        },
        {
            "answer_name": "Other"
        }
    ]
};


describe('PollService', function() {
    before(function () {
        castVoteStub = sinon.stub(PollDAO, 'castVote');
        pollWithResultsStub = sinon.stub(PollDAO, 'getPollWithResults');
        pollWithAnsersStub = sinon.stub(PollDAO, 'getPollWithAnswers');

        pollDAO = proxyquire('../services/PollService', {
            PollDAO: {
                castVote: castVoteStub,
                getPollWithResults: pollWithResultsStub,
                getPollWithAnswers: pollWithAnsersStub
            }
        } );

        castVoteStub.withArgs(1, 1, {}).returns(Promise.resolve(mockVoteResult));
        pollWithResultsStub.withArgs(1).returns(Promise.resolve(mockVoteResult));
        pollWithAnsersStub.withArgs(1).returns(Promise.resolve(mockPollAndAnswersResponse));
    });

    after(function () {
        PollDAO.castVote.restore();
    });

    describe('#tallyVotes()', function() {
        it('should return the correct vote count', function() {
            var count = PollService.__get__('tallyVotes')(mockVoteResult.results);
            assert.strictEqual(1, count);
        });
    });

    describe('#isThreshold()', function() {
        it('should return the correct vote count', function() {
            var threshold = PollService.__get__('isThreshold')(1, mockVoteResult.thresholds);
            assert.isDefined(threshold);
        });
    });

    describe('#vote()', function() {
        it('should return the poll with total votes and threshold', function(done) {
            var result = PollService.vote(1, 1, {}); //Votes mocked out
            result.then((res) => {
                assert.strictEqual(res.poll.question, "What's your favorite animal?");
                assert.strictEqual(res.poll.total, 1);
                assert.isDefined(res.threshold);
                done();
            }).catch((err) => {
                done(err);
            });
        })
    });

    describe('#getPollAndResults()', function() {
        it('should return the poll with results', function(done) {
            var result = PollService.getPollAndResults(1); //Votes mocked out
            result.then((res) => {
                assert.strictEqual(res.poll.question, "What's your favorite animal?");
                assert.strictEqual(res.poll.total, 1);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });

    describe('#getPollAndAnswers()', function() {
        it('should return the poll with answers', function(done) {
            var result = PollService.getPollAndAnswers(1); //Votes mocked out
            result.then((res) => {
                assert.strictEqual(res.poll.question, "What's your favorite animal?");
                assert.lengthOf(res.answers, 3);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    })
});

