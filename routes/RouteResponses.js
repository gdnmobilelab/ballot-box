var response = function(status) {
    return function(res, msg) {
        res.status(status);
        res.send(typeof msg === 'object' ? msg : {message: msg});
    }
};

module.exports = {
    OK: response(200),
    BAD_REQUEST: response(400),
    INTERNAL_SERVER_ERROR: response(500)
};
