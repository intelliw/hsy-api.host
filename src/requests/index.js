//@ts-check
'use strict';
/**
 * ./requests/index.js   
 */
module.exports = require('./Request');

// Request subtypes  
module.exports.EnergyGet = require('./EnergyGet');
module.exports.DevicesDatasetsPost = require('./DevicesDatasetsPost');
module.exports.DeviceDatasetGet = require('./DeviceDatasetGet');

// aggregates
module.exports.Validate = require('./Validate');