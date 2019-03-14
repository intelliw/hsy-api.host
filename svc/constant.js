/**
 * ./svc/constant.js
 * 
 * global constants
 */
const path = require('path');

module.exports = {
    folder: {
        VIEWS: path.dirname(require.resolve('../api/view'))
    }
};

