var express = require('express');
var router = express.Router();
var config = require('../config');
var QuizService = require('../services/QuizService');
var QuizResponseService = require('../services/QuizResponseService');
var SNSService = require('../services/SNSService');
var WebPushService = require('../services/WebPushService');
var APIKeyFilter = require('../middleware/api-key-filter');
var Responses = require('./RouteResponses');
var OK = Responses.OK;
var BAD_REQUEST = Responses.BAD_REQUEST;

router.get('/:quizId/chain', function(req, res, next) {
    QuizService.getQuiz(req.params.quizId)
        .then((quiz) => {
            return QuizResponseService.prepareChainResponse(quiz);
        })
        .then((chain) => {
            return OK(res, chain);
        })
        .catch((err) => {
            BAD_REQUEST(res, err);
        });
});

router.post('/:quizId/submitAnswers', APIKeyFilter, function(req, res, next) {
    QuizService.submitAnswers(req.body.answers, req.body.user)
        .then((result) => {
            return QuizService.getQuizResults(req.body.user, req.params.quizId, result.sessionId);
        })
        .then((quizResults) => {
            var answers = quizResults.answers.reduce((coll, answer) => {
                if (answer.correct_answer) {
                    coll['correct'] = coll['correct'].concat([answer.id]);
                } else {
                    coll['incorrect'] = coll['incorrect'].concat([answer.id]);
                }

                return coll;
            }, {
                correct: [],
                incorrect: []
            });

            quizResults.user = {
                correct: req.body.answers.filter((answer) => {
                    return answers.correct.indexOf(answer.answerId) >= 0
                }),
                incorrect: req.body.answers.filter((answer) => {
                    return answers.incorrect.indexOf(answer.answerId) >= 0
                }),
            };

            return quizResults;
        })
        .then((quiz) => {
            WebPushService.pushToUser(req.body.user, QuizResponseService.prepareQuizResponse(quiz));
        })
        .then((response) => {
            return OK(res, response);
        })
        .catch((err) => {
            console.log(err);
            return BAD_REQUEST(res, err);
        });
});


module.exports = router;
