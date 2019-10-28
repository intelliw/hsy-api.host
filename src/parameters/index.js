//@ts-check
'use strict';
/**
 * ./parameters/index.js
 * api parameters
 * 
 */

module.exports = require('./Param');

// Param subtypes  
module.exports.Period = require('./Period');
module.exports.Datasets = require('./Datasets');

module.exports.Accept = require('./Accept');
module.exports.ContentType = require('./ContentType');
module.exports.ApiKey = require('./ApiKey');
