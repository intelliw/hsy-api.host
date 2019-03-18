/**
 * ./svc/constant.js
 * global constants
 */
let path = require('path');     // this is a node package not the '../paths' applicaiton module

module.exports.folders = {
    VIEWS: path.dirname(require.resolve('../responses'))
};

// mime types used in headers
module.exports.mimeTypes = {
    applicationJson : 'application/json',
    applicationCollectionJson : 'application/vnd.collection+json',
    textHtml : 'text/html',
    textPlain : 'text/plain'
};

// general constants
module.exports.SUPPORTED_VERSIONS = 'v1.0 v1.1';
module.exports.HOST_NAME = 'api.endpoints.sundaya.cloud.goog';