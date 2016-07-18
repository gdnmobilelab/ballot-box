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
        .then(() => {
            return QuizService.getUserQuizResults(req.body.user, req.params.quizId);
        })
        .then((quiz) => {
            WebPushService.pushToUser(req.body.user, QuizResponseService.prepareQuizResponse(quiz));
        })
        .then((response) => {
            return OK(res, response);
        })
        .catch((err) => {
            return BAD_REQUEST(res, err);
        });
});


module.exports = router;
