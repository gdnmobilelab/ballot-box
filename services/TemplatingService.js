var _ = require('lodash');

var TemplatingService = {
    template: function(str, opts) {
        return _.template(str)(opts);
    }
};

module.exports = TemplatingService;