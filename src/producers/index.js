//@ts-check
/**
 * ./producers/index.js
 * 
 * producers 
 */
module.exports = require('./Producer');

module.exports.factory = require('./factory');

module.exports.MonitoringPms = require('./MonitoringPms');
module.exports.MonitoringMppt = require('./MonitoringMppt');
module.exports.MonitoringInverter = require('./MonitoringInverter');
