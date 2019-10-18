//@ts-check
'use strict';
/**
 * PACKAGE: ./environment/index.js
 * *shared* services, tools, constants.. for the shared environment
 */

module.exports = require('./env');
module.exports.utils = require('./utils');
module.exports.enums = require('./enums');

module.exports.errors = require('./errors');

module.exports.Stackdriver = require('./Stackdriver');
module.exports.Logger = require('./Logger');

module.exports.log = new this.Logger();


