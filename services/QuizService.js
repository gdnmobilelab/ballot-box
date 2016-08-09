var QuizDAO = require('../dao/QuizDAO');
var _ = require('lodash');

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

                    return _.merge({}, q.quiz, {'questions': questions});
                }
            })
    },

    submitAnswers: function(answers, user) {
        return QuizDAO.answerQuiz(answers, user);
    },

    getQuizResults: function(user, quizId, sessionId) {
        return QuizDAO.getQuizResults(user, quizId, sessionId)
            .then(function(q) {
                //No quiz
                if (!q.quiz) {
                    return Promise.reject();
                } else {
                    return _.merge({}, q.quiz,
                        {
                            answers: q.answers,
                            questions: q.questions,
                            responses: q.responses.reduce((coll, resp) => {
                                coll[resp.number_answered_correctly] = resp.response;

                                return coll;
                            }, {})
                        });
                }
            })
    }

};


module.exports = QuizService;