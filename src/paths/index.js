//@ts-check
/**
 * ./paths/index.js   
 */

module.exports = require('./Request');
module.exports.EnergyRequest = require('./EnergyRequest');

module.exports.energyRouter = require('./energyRouter');
module.exports.devicesRouter = require('./devicesRouter');
module.exports.diagnosticsRouter = require('./diagnosticsRouter');


