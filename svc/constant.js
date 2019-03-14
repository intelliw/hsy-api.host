/**
 * ./svc/constant.js
 * 
 * global constants
 */
let path = require('path');

module.exports = {
    
    // grouped constants 
    folder: folder,

    // general constants
    SUPPORTED_VERSIONS : 'v1.0 v1.1'
}

function folder() {
    VIEWS = path.dirname(require.resolve('../vws'));
}

