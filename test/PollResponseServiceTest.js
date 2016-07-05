var PollResponseService = require('../services/PollResponseService');
var assert = require('chai').assert;

var mockResponse = {
    "id": "b442d44a-42b5-11e6-8858-520e4f6405ee",
    "response_title": "Results: <%= poll.total %> votes",
    "response_body": "<%= results %>",
    "response_on_tap": null,
    "response_on_close": null,
    "response_action_button_one_commands": null,
    "response_action_button_one_text": null,
    "response_action_button_one_icon": null,
    "response_action_button_two_commands": null,
    "response_action_button_two_text": null,
    "response_action_button_two_icon": null,
    "response_type": 1
};

var mockResponseWithOneButton = {
    "id": "b442d44a-42b5-11e6-8858-520e4f6405ee",
    "response_title": "Results: <%= poll.total %> votes",
    "response_body": "<%= results %>",
    "response_on_tap": null,
    "response_on_close": null,
    "response_action_button_one_commands": '[{"command": "notification.close"}, {"command": "browser.openURL", "options": {"url": "http://www.theguardian.com/politics/live/2016/jun/24/eu-referendum-brexit-live-europe-leave-remain-britain"}}]',
    "response_action_button_one_text": 'Dog',
    "response_action_button_one_icon": null,
    "response_action_button_two_commands": null,
    "response_action_button_two_text": null,
    "response_action_button_two_icon": null,
    "response_type": 1
};

var mockPoll = {
    "id": "a373bdb0-3fb7-11e6-8858-520e4f6405ee",
    "question": "What's your favorite animal?",
    "icon": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Welchcorgipembroke.JPG",
    "is_closed": 0,
    "tag": "favorite-animal",
    "sns_topic": "arn:aws:sns:us-east-1:348747012323:staging__favorite_animal",
    "next_question_text": "Next issue",
    "next_question_icon": "https://www.gdnmobilelab.com/data/primary-results/static-images/browser_icon_big.png",
    "created_on": "2016-07-01T18:14:23.000Z",
    "modified_on": "2016-07-01T18:14:23.000Z",
    "total": 1
};

var mockResults = [
    {
        "answer_name": "Dog",
        "votes": 1
    },
    {
        "answer_name": "Cat",
        "votes": 0
    },
    {
        "answer_name": "Other",
        "votes": 0
    }
];

describe('PollResponseService', function() {
    describe('#preparePollResponse()', function() {
        it('should template results', function() {
            var formattedResponse = PollResponseService.preparePollResponse(mockResponse, mockPoll, mockResults);
            assert.include(formattedResponse[0].options.options.body, 'Dog: 100%');
        });

        it('should template vote counts', function() {
            var formattedResponse = PollResponseService.preparePollResponse(mockResponse, mockPoll, mockResults);
            assert.include(formattedResponse[0].options.title, '1 votes');
        });

        it('should template action buttons', function() {
            var formattedResponse = PollResponseService.preparePollResponse(mockResponseWithOneButton, mockPoll, mockResults);
            assert.strictEqual(formattedResponse[0].options.actionCommands[0].template.title, 'Dog');
        });
    });
});

