var util = require('../util/util');


var PollResponseService = {
    preparePollResponse: function (response, poll, results) {
        var actionCommands = [],
            opts = {response: response, poll: poll, results: results};

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
                        "body": TemplatingService.template(response.response_body),
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
    
    prepareChainResponse: function(p) {
        var poll = p.poll,
            answers = p.answers,
            chainResponse = {};

        chainResponse.chain = poll.tag;

        chainResponse.values = answers.map((answer, index) => {
            var commands = [];

            //If this poll has an sns topic, subscribe user's to it
            //when they answer
            if (poll.sns_topic) {
                commands.push(
                    {
                        "command": "pushy.subscribeToTopic",
                        "options": {
                            "topic": util.topicFromSNSARN(poll.sns_topic)
                        }
                    }
                )
            }

            //Add the cast vote and close actions
            commands.concat([
                {
                    "command": "poll.castVote",
                    "options": {
                        "pollId": poll.id,
                        "answerId": answer.id
                    }
                },
                {
                    "command": "notification.close"
                }
            ]);

            return {
                title: poll.title,
                notificationTemplate: {
                    body: poll.question,
                    tag: poll.tag,
                    icon: poll.icon,
                    data: {}
                },
                actions: [
                    {
                        "label": "web-link",
                        "commands": commands,
                        "template": {
                            "title": answer.answer_name
                        }
                    },
                    {
                        "label": "web-link",
                        "commands": [
                            {
                                "command": "chains.notificationAtIndex",
                                "options": {
                                    "chain": poll.tag,
                                    "index": index === answers.length - 1 ? 0 : index + 1 //If last, cycle
                                }
                            }
                        ],
                        "template": {
                            "title": poll.next_question_text,
                            "icon": poll.next_question_icon
                        }
                    }
                ]
            }
        });

        return [chainResponse];
    }
};

module.exports = PollResponseService;