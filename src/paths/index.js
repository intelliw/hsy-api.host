//@ts-check
/**
 * ./paths/index.js   
 */

module.exports = require('./Request');
module.exports.EnergyGetRequest = require('./EnergyGet');
module.exports.DevicesDatasetsPost = require('./DevicesDatasetsPost');
module.exports.DeviceDatasetGet = require('./DeviceDatasetGet');

module.exports.energyRouter = require('./energyRouter');
module.exports.devicesRouter = require('./devicesRouter');
module.exports.diagnosticsRouter = require('./diagnosticsRouter');


