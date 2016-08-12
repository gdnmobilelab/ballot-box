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

        var body = `You scored ${quiz.user.correct.length}/${quiz.questions.length}\n\n${quiz.responses[quiz.user.correct.length].body}`;

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

    prepareResultsChain: function(quiz) {
        var chainResponse = {};

        chainResponse.chain = `${quiz.tag}-results`;

        chainResponse.values = quiz.responses.sort((a, b) => a.number_answered_correctly - b.number_answered_correctly).map((response) => {
            var onTap = [
                {
                    "command": "notification.close"
                }
            ];

            if (quiz.on_tap) {
                onTap = onTap.concat(quiz.on_tap);
            }

            var body = `Your score was ${response.number_answered_correctly}/${quiz.questions.length}.\n\n${response.response_body}`,
                title = response.response_title || `${quiz.title}`;
            return {
                    title: title,
                    options: {
                        tag: quiz.tag,
                        body: body,
                        data: {
                            onTap: onTap
                        },
                        icon: quiz.icon
                    },
                    actionCommands: [
                        {
                            label: "web-link",
                            commands: [
                                {
                                    command: "browser.openURL",
                                    options: {
                                        // "url": `intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=${encodeURI(`https://twitter.com/share?url=${config.mobileLabURL}&text=I got ${quiz.user.correct.length}/${quiz.questions.length} correct on ${quiz.title};end`)}`
                                        "url": `https://twitter.com/share?url=https://www.gdnmobilelab.com/olympics&text=${encodeURI(`I got ${response.number_answered_correctly}/${quiz.questions.length} correct on the ${quiz.social_title} from @gdnmobilelab`)}`
                                    }
                                },
                                {
                                    "command": "notification.close"
                                }
                            ],
                            template: {
                                title: "Tweet"
                            }
                        },
                        {
                            label: "web-link",
                            commands: [
                                {
                                    command: "browser.openURL",
                                    options: {
                                        url: quiz.quiz_url
                                    }
                                },
                                {
                                    command: "notification.close"
                                }
                            ],
                            template: {
                                title: "Take Full Quiz"
                            }
                        }
                    ]
                }
        });

        return chainResponse
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
                        notificationID: quiz.tag,
                        onTap: quiz.on_tap
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
                            "title": "⏩ Start Quiz"
                        }
                    }
                ]
            }
        ];

        chainResponse.values = chainResponse.values.concat(questions.map((question, questionIndex) => {
                var answers = question.answers,
                    last = questionIndex === questions.length - 1,
                    title = `Question ${questionIndex + 1}/${questions.length}`;

            var actions = answers.map((answer, index) => {
                var commands = [];

                var nextQuestionCommands = {
                    "command": "chains.notificationAtIndex",
                    "options": {
                        "chain": quiz.tag,
                        "index": questionIndex + 2
                    }
                };

                if (last) {
                    nextQuestionCommands = {
                        "command": "quiz.submitAnswers",
                        "options": {
                            "quizId": quiz.id,
                            "chain": `${quiz.tag}-results`
                        }
                    }
                }

                var nextQuestionActions = {
                        "label": "web-link",
                        "commands": [
                            nextQuestionCommands
                        ],
                        "template": {
                            "title": !last ? 'Next Question' : 'Get Results'
                        }
                    };

                var answerText;
                if (answer.answer_text) {
                    answerText = answer.answer_text;
                } else {
                    answerText = answer.correct_answer ? 'Correct' : 'Incorrect';
                }

                var correctOrIncorrect = answer.correct_answer ? 'CORRECT 😀' : 'INCORRECT 🙁',
                    answerQuestion =  {
                        "command": "quiz.answerQuestion",
                        "options": {
                            "chain": quiz.tag,
                            "quizId": quiz.id,
                            "questionId": question.id,
                            "answerId": answer.id,
                            "nextText": !last ? 'Next Question' : 'Get Results',
                            "answerBody": answerText,
                            "answerTitle": `${title}: ${correctOrIncorrect}`,
                            "trueOrFalse": answerText,
                            "showNotification": {
                                title: `${title}: ${correctOrIncorrect}`,
                                options: {
                                    body: answer.answer_text,
                                    tag: quiz.tag,
                                    icon: question.icon || quiz.icon,
                                    data: {
                                        onTap: quiz.on_tap
                                    }
                                },
                                actionCommands: [nextQuestionActions]
                            },
                            "correctAnswer": answer.correct_answer,
                        }
                    };


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
                title: title,
                notificationTemplate: {
                    body: question.question,
                    tag: quiz.tag,
                    icon: question.icon || quiz.icon,
                    data: {
                        onTap: quiz.on_tap
                    }
                },
                actions: actions
            }
        }));

        var resp = [chainResponse, this.prepareResultsChain(quiz)];
        cache.put(quiz.id, resp, 60 * 5 * 1000);

        return resp;
    }
};

module.exports = QuizResponseService;