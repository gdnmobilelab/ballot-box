var QuizDAO = require('../dao/QuizDAO');
var _ = require('lodash');
var cache = require('memory-cache');

var QuizService = {
    getQuiz: function(quizId) {
        return QuizDAO.getQuizWithQuestionAnswers(quizId)
            .then(function(q) {
                //No quizz
                if (!q.quiz) {
                    return Promise.reject();
                } else {
                    var questions = q.questions.map((question) => {
                        question['answers'] = q.answers.filter((answer) => {
                            return answer.quiz_question_id === question.id
                        });

                        return question;
                    });

                    return _.merge({}, q.quiz, {questions: questions, responses: q.responses});
                }
            })
    },

    submitAnswers: function(answers, user) {
        return QuizDAO.answerQuiz(answers, user);
    },

    getQuizResults: function(user, quizId) {
        var quizResults = cache.get(`quiz-results-${quizId}`);

        if (quizResults) {
            return Promise.resolve(quizResults)
        } else {
            return QuizDAO.getQuizResults(user, quizId)
                .then(function (q) {
                    //No quiz
                    if (!q.quiz) {
                        return Promise.reject();
                    } else {
                        var quizResults = _.merge({}, q.quiz,
                            {
                                answers: q.answers,
                                questions: q.questions,
                                responses: q.responses.reduce((coll, resp) => {
                                    coll[resp.number_answered_correctly] = {
                                        body: resp.response_body,
                                        title: resp.response_title
                                    };

                                    return coll;
                                }, {})
                            });

                        cache.put(`quiz-results-${quizId}`, quizResults, 60 * 10 * 1000);
                        return quizResults
                    }
                })
        }
    }

};


module.exports = QuizService;