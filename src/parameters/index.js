//@ts-check
'use strict';
/**
 * ./parameters/index.js
 * api parameters
 * 
 */

module.exports = require('./Param');

// Param subtypes  
module.exports.Accept = require('./Accept');
module.exports.ApiKey = require('./ApiKey');
module.exports.ContentType = require('./ContentType');
module.exports.Datasets = require('./Datasets');
module.exports.Period = require('./Period');
