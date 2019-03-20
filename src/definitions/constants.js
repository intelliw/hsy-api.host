//@ts-check
/**
 * ./svc/constant.js
 * global constants
 */
let path = require('path');     // this is a node package not the '../paths' applicaiton module

module.exports.folders = {
    VIEWS: path.dirname(require.resolve('../../responses'))
};

// mime types used in headers
module.exports.mimeTypes = {
    applicationJson : 'application/json',
    applicationCollectionJson : 'application/vnd.collection+json',
    textHtml : 'text/html',
    textPlain : 'text/plain'
};

// mime types used in headers
module.exports.params = {
    DEFAULT_DURATION : '1',
    DEFAULT_SITE : '999'
};

// general constants
module.exports.sys = {
    ACTIVE_VERSIONS : 'v1.0 v1.1',
    HOST_NAME : 'api.endpoints.sundaya.cloud.goog',
    DATE_FORMAT : 'YYYYMMDDTHHmmss.SSS±HHmm',
}

// the starting hour of each timeofday 
module.exports.timeOfDayStart = {
    morning: '6',
    afternoon: '12',
    evening: '18',
    night: '0'
};