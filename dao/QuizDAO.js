var config = require('../config');
var db = require('mysql-promise')();
var mysql = require('mysql');
var Promise = require('bluebird');
var pool = mysql.createPool(config.db.ballot);

db.configure(config.db.ballot);

var QuizDAO = {
    /**
     *
     * @param pollId number
     * @param answerId number
     * @param user object
     */
    answerQuestion: function(answerId, user) {
        return db.query('call p_AnswerQuizQuestion(?, ?, ?, ?)', [answerId, user.id, JSON.stringify(user.subscription)])
            .then(function(results) {
                //p_AnswerQuizQuestion has four result sets
                //Result Set 1: Contains information about the quiz (name, question, responses)
                //Result Set 2: Contains the results of the quiz (answers and vote counts)
                //Result Set 3: Contains the response template
                //Result Set 4: Contains information about the poll thresholds
                return {
                    quiz: results[0][0][0],
                    results: results[0][1],
                    completedResponse: results[0][2][0],
                    updateResponse: results[0][3][0],
                    thresholds: results[0][4]
                };
            }).catch((e) => {
                var msg;

                switch (e.code) {
                    case 'ER_DUP_ENTRY':
                        msg = 'User has already submitted an answer.';
                        break;
                    default:
                        console.log(e);
                        msg = 'There was a problem with the request';
                }

                return Promise.reject({message: msg});
            });
    },

    getQuizWithQuestionAnswers: function(quizId) {
        return db.query('call p_GetQuizQuestionsAndAnswers(?)', [quizId])
            .then(function(results) {
                //p_GetQuizQuestionsAnswers has three result sets
                //Result Set 1: Contains information about the quiz
                //Result Set 2: Contains information about quiz questions
                //Result Set 3: Contains information about quiz question answers
                return {
                    quiz: results[0][0][0],
                    questions: results[0][1],
                    answers: results[0][2]
                };
            });
    },

    answerQuiz: function(answers, user) {
        var subscription = JSON.stringify(user.subscription);
        var activeConnection;

        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                activeConnection = connection;

                connection.beginTransaction(function (err) {
                    if (err) {
                        return resolve(err);
                    }

                    Promise.all(answers.map((answer) => {
                        return new Promise((answerResolve, answerReject) => {
                            connection.query('call p_AnswerQuizQuestion(?, ?, ?, ?)', [answer.questionId, answer.answerId, user.id, subscription], function (err, result) {
                                if (err) {
                                    return answerReject();
                                }

                                answerResolve();
                            });

                        })
                    })).then(() => {
                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    reject();
                                });
                            }

                            resolve();
                        });
                    }).catch((error) => {
                        console.log(error);
                        connection.rollback(function () {});
                        reject(error);
                    });
                });
            });
        }).then((result) => {
            activeConnection.release();
            return result;
        }).catch((e) => {
            activeConnection.release();
            return Promise.reject(e);
        });
    },

    getUserQuizResults: function(user, quizId) {
        return db.query('call p_GetUserQuizResults(?, ?)', [user.id, quizId])
            .then((results) => {
                return {
                    quiz: results[0][0][0],
                    questions: results[0][1],
                    user_results: results[0][2],
                    quiz_results: results[0][3]
                }
            })
    }

};

module.exports = QuizDAO;