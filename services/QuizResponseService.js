var util = require('../util/util');
var TemplatingService = require('./TemplatingService');
var cache = require('memory-cache');
var _ = require('lodash');

var QuizResponseService = {
    prepareQuizResponse: function (quiz) {
        var numCorrectByUsers = [];

        for (var i = 0; i < quiz.questions.length + 1; i++) {
            var countExists = quiz.results.num_correct_by_users.find((n) => n.correct_count === i);
            numCorrectByUsers.push(countExists || {num_users: 0, correct_count: i});
        }

        var users_response = numCorrectByUsers.map((results) => {
            return `${Math.round((results.num_users / quiz.results.total_users) * 100)}% scored ${results.correct_count}/${quiz.questions.length}`
        }).join('\n');

        return [
            {
                "command": "notification.show",
                "options": {
                    "title": `Total responses: ${quiz.results.total_users}`,
                    "options": {
                        "tag": quiz.tag,
                        "body": `You scored ${quiz.user.correct.length}/${quiz.questions.length}\n${users_response}`,
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
                    // {
                    //     "label": "web-link",
                    //     "commands": [
                    //         {
                    //             "command": "notification.close"
                    //         }
                    //     ],
                    //     "template": {
                    //         "title": "Close"
                    //     }
                    // }
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
                    commands = commands.concat([
                        {
                            "command": "quiz.submitAnswers",
                            "options": {
                                "quizId": quiz.id
                            }
                        },
                        {
                            "command": "notification.close"
                        }
                    ]);
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

        cache.put(quiz.id, [chainResponse], 60 * 5 * 1000);

        return [chainResponse];
    }
};

module.exports = QuizResponseService;