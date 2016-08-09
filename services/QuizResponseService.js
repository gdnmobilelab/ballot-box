var util = require('../util/util');
var TemplatingService = require('./TemplatingService');
var cache = require('memory-cache');
var config = require('../config');

var QuizResponseService = {
    prepareQuizResponse: function (quiz) {
        var onTap = [
            {
                "command": "notification.close"
            }
        ];

        if (quiz.on_tap) {
            onTap = onTap.concat(quiz.on_tap);
        }

        var body = `You scored ${quiz.user.correct.length}/${quiz.questions.length}\n\n${quiz.responses[quiz.user.correct.length]}`;

        return [
            {
                "command": "notification.show",
                "options": {
                    "title": `${quiz.title} Results`,
                    "options": {
                        "tag": quiz.tag,
                        "body": body,
                        "data": {
                            "onTap": onTap
                        },
                        "icon": quiz.icon
                    },
                    "actionCommands": [
                        {
                            "label": "web-link",
                            "commands": [
                                {
                                    "command": "browser.openURL",
                                    "options": {
                                        // "url": `intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=${encodeURI(`https://twitter.com/share?url=${config.mobileLabURL}&text=I got ${quiz.user.correct.length}/${quiz.questions.length} correct on ${quiz.title};end`)}`
                                        "url": `https://twitter.com/share?url=${config.mobileLabURL}&text=${encodeURI(`I got ${quiz.user.correct.length}/${quiz.questions.length} correct on ${quiz.title}`)}`
                                    }
                                }
                            ],
                            "template": {
                                "title": "Tweet"
                            }
                        },
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
                                "title": "Retake quiz"
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
                            "title": "Start Quiz ➡️"
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
                var commands = [],
                    answerText;

                if (answer.answer_text) {
                    answerText = answer.answer_text;
                } else {
                    answerText = answer.correct_answer ? 'Correct' : 'Incorrect';
                }

                var answerQuestion =  {
                    "command": "quiz.answerQuestion",
                    "options": {
                        "chain": quiz.tag,
                        "quizId": quiz.id,
                        "questionId": question.id,
                        "answerId": answer.id,
                        "nextText": "Results",
                        "trueOrFalse": answerText
                    }
                };

                if (!last) {
                    answerQuestion.options.nextText = 'Next question';
                    answerQuestion.options.index = questionIndex + 2;
                }

                //Add the cast vote and close actions
                commands = commands.concat([
                    answerQuestion
                ]);

                return  {
                    "label": "web-link",
                    "commands": commands,
                    "template": {
                        "title": answer.answer_name
                    }
                }
            });

            return {
                title: `Question #${questionIndex + 1}`,
                notificationTemplate: {
                    body: question.question,
                    tag: quiz.tag,
                    icon: question.icon || quiz.icon,
                    data: {}
                },
                actions: actions
            }

        }));

        cache.put(quiz.id, [chainResponse], 60 * 5 * 1000);

        return [chainResponse];
    }
};

module.exports = QuizResponseService;