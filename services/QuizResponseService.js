var util = require('../util/util');
var TemplatingService = require('./TemplatingService');
var cache = require('memory-cache');
var _ = require('lodash');

var QuizResponseService = {
    prepareQuizResponse: function (response, poll, results) {
        var actionCommands = [],
            opts = {response: response, poll: poll, results: results.map((result) => {
                var res;

                if (poll.total === 0) {
                    res = `${result.answer_name}: 0%`
                } else {
                    res = `${result.answer_name}: ${Math.round((result.votes / poll.total) * 100)}%`
                }
                return res;
            }).join(' ')};

        if (response.response_action_button_one_commands) {
            actionCommands.push({
                "label": "web-link",
                "commands": JSON.parse(response.response_action_button_one_commands),
                "template": {
                    "icon": response.response_action_button_one_icon,
                    "title": response.response_action_button_one_text
                }
            });
        }

        if (response.response_action_button_two_commands) {
            actionCommands.push({
                "label": "web-link",
                "commands": JSON.parse(response.response_action_button_two_commands),
                "template": {
                    "icon": response.response_action_button_two_icon,
                    "title": response.response_action_button_two_text
                }
            });
        }

        return [
            {
                "command": "notification.show",
                "options": {
                    "title": TemplatingService.template(response.response_title, opts),
                    "options": {
                        "tag": poll.tag,
                        "body": TemplatingService.template(response.response_body, opts),
                        "data": {
                            "onTap": JSON.parse(response.response_on_tap)
                        },
                        "icon": poll.icon
                    },
                    "actionCommands": actionCommands
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
                // commands.push(
                //     {
                //         "command": "quiz.answerQuestion",
                //         "options": {
                //             "quizId": quiz.id,
                //             "answerId": answer.id
                //         }
                //     }
                // );

                if (last) {
                    // commands.push({
                    //     "command": "quiz.submitAnswers",
                    //     "options": {
                    //         "quizId": quiz.id
                    //     }
                    // })
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