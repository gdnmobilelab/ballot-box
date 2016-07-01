var config = require('../config');

module.exports = function(req, res, next) {
    var apiKey = req.header('x-polls-api-key');

    if (!apiKey) {
        res.status(401);
        res.send({message: 'Missing x-polls-api-key header'});
        res.end();
    } else {
        if (apiKey != config.apiKey) {
            res.status(401);
            res.send({message: 'Incorrect x-polls-api-key header'});
            res.end();
        } else {
            next();
        }
    }

};