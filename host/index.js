/**
 * ./host/index.js
 * common services and tools. 
 */
module.exports.config = require('./config');
module.exports.util = require('./util');

module.exports.NAME = require('../definitions').constants.HOST_NAME;    // the api endpoint's host name  