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

    getUserQuizResults: function(user, quizId) {
        return QuizDAO.getUserQuizResults(user, quizId)
            .then(function(q) {
                //No quiz
                if (!q.quiz) {
                    return Promise.reject();
                } else {
                    return _.merge({}, q.quiz,
                        {
                            questions: q.questions,
                            user: {
                                correct: q.user_results.filter((result) => {
                                    return result.correct_answer
                                }),
                                incorrect: q.user_results.filter((result) => {
                                    return !result.correct_answer
                                })
                            },
                            results: q.quiz_results
                        });
                }
            })
    }

};


module.exports = QuizService;