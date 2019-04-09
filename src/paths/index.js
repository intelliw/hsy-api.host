//@ts-check
/**
 * ./paths/index.js   
 */

module.exports = require('./Request');
module.exports.EnergyGetRequest = require('./EnergyGetRequest');
module.exports.DatasetsPostRequest = require('./DatasetsPostRequest');

module.exports.energyRouter = require('./energyRouter');
module.exports.devicesRouter = require('./devicesRouter');
module.exports.diagnosticsRouter = require('./diagnosticsRouter');


