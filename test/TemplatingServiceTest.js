var TemplatingService = require("../services/TemplatingService");
var assert = require('chai').assert;

describe('TemplatingService', function() {
    describe('#template()', function() {
        it('should template a string', function() {
            var opts = {'replaceMe': 'Hi!'};
            var tmp = TemplatingService.template('<%= replaceMe %> should get replaced', opts);
            assert.include(tmp, 'Hi!');
        });
    });
});

