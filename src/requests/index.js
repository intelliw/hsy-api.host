//@ts-check
/**
 * ./requests/index.js   
 */

module.exports = require('./Request');

// subtypes  
module.exports.EnergyGet = require('./EnergyGet');
module.exports.DevicesDatasetsPost = require('./DevicesDatasetsPost');
module.exports.DeviceDatasetGet = require('./DeviceDatasetGet');

// aggregates
module.exports.Validate = require('./Validate');