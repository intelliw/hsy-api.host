/**
 * ./svc/constant.js
 * global constants
 */
let path = require('path');


module.exports.folder = {
    VIEWS: path.dirname(require.resolve('../vws'))
};

module.exports.SUPPORTED_VERSIONS = 'v1.0 v1.1';