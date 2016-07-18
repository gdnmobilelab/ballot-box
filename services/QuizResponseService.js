var util = require('../util/util');
var TemplatingService = require('./TemplatingService');
var cache = require('memory-cache');
var _ = require('lodash');

var QuizResponseService = {
    prepareQuizResponse: function (quiz) {
        var users_response = quiz.results.map((results) => {
            var multiplePeople = results.num_users === 1 ? 'person' : 'people';
            return `${results.num_users} other ${multiplePeople} answered ${results.correct_count} questions correctly`
        });

        return [
            {
                "command": "notification.show",
                "options": {
                    "title": quiz.title,
                    "options": {
                        "tag": quiz.tag,
                        "body": `You answered ${quiz.user.correct.length} questions out of ${quiz.questions.length} correctly.\n${users_response}`,
                        "data": {
                            "onTap": [
                                {
                                    "command": "notification.close"
                                }
                            ]
                        },
                        "icon": quiz.icon
                    },
                    "actionCommands": [
                        {
                            "label": "web-link",
                            "commands": [
                                {
                                    "command": "notification.close"
                                }
                            ],
                            "template": {
                                "title": "Close"
                            }
                        }
                    ]
                }
            }
        ]
    },

    prepareChainResponse: function(quiz) {
        var chainResponse = {},
            cachedQuiz = cache.get(quiz.id),
            questions = quiz.questions;

        if (cachedQuiz) {
            return cachedQuiz;
        }

        chainResponse.chain = quiz.tag;

        chainResponse.values = [
            {
                title: quiz.title,
                notificationTemplate: {
                    body: quiz.description,
                    tag: quiz.tag,
                    icon: quiz.icon,
                    data: {
                        notificationID: quiz.tag
                    }
                },
                actions: [
                    {
                        "label": "web-link",
                        "commands": [
                            {
                                "command": "chains.notificationAtIndex",
                                "options": {
                                    "chain": quiz.tag,
                                    "index": 1
                                }
                            }
                        ],
                        "template": {
                            "title": "Start"
                        }
                    },
                    {
                        "label": "web-link",
                        "commands": [
                            {
                                "command": "notification.close"
                            }
                        ],
                        "template": {
                            "title": "Close"
                        }
                    }
                ]
            }
        ];

        chainResponse.values = chainResponse.values.concat(questions.map((question, questionIndex) => {
                var answers = question.answers;
                last = questionIndex === questions.length - 1;

            var actions = answers.map((answer) => {
                var commands = [];

                //Add the cast vote and close actions
                commands.push(
                    {
                        "command": "quiz.answerQuestion",
                        "options": {
                            "quizId": quiz.id,
                            "questionId": question.id,
                            "answerId": answer.id
                        }
                    }
                );

                if (last) {
                    commands.push({
                        "command": "quiz.submitAnswers",
                        "options": {
                            "quizId": quiz.id
                        }
                    })
                } else {
                    commands.push({
                        "command": "chains.notificationAtIndex",
                        "options": {
                            "chain": quiz.tag,
                            "index": questionIndex + 2
                        }
                    })
                }

                return  {
                    "label": "web-link",
                    "commands": commands,
                    "template": {
                        "title": answer.answer_name
                    }
                }
            });

            return {
                title: quiz.title,
                notificationTemplate: {
                    body: question.question,
                    tag: quiz.tag,
                    icon: quiz.icon,
                    data: {}
                },
                actionCommands: actions
            }

        }));

        cache.put(quiz.id, [chainResponse]);

        return [chainResponse];
    }
};

module.exports = QuizResponseService;