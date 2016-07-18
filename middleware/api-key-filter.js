var config = require('../config');

module.exports = function(req, res, next) {
    var apiKey = req.header('X-Ballot-API-Key');

    if (!apiKey) {
        res.status(401);
        res.send({message: 'Missing X-Ballot-API-Key header'});
        res.end();
    } else {
        if (apiKey != config.apiKey) {
            res.status(401);
            res.send({message: 'Incorrect X-Ballot-API-Key header'});
            res.end();
        } else {
            next();
        }
    }

};