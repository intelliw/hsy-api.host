/**
 * ./svc/constant.js
 * global constants
 */
let path = require('path');     // this is a node package not the '../paths' applicaiton module

module.exports.folder = {
    VIEWS: path.dirname(require.resolve('../responses'))
};

module.exports.SUPPORTED_VERSIONS = 'v1.0 v1.1';