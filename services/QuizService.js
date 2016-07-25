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
                    var total_users = q.quiz_results.reduce((coll, result) => {
                        return coll + result.num_users;
                    }, 0);

                    return _.merge({}, q.quiz,
                        {
                            answers: q.answers,
                            questions: q.questions,
                            results: { num_correct_by_users: q.quiz_results, total_users: total_users }
                        });
                }
            })
    }

};


module.exports = QuizService;