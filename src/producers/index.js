//@ts-check
'use strict';
/**
 * ./producers/index.js
 * 
 * producers 
 */
module.exports.KafkaProducer = require('./KafkaProducer');

module.exports.factory = require('./factory');

module.exports.MonitoringPms = require('./MonitoringPms');
module.exports.MonitoringMppt = require('./MonitoringMppt');
module.exports.MonitoringInverter = require('./MonitoringInverter');
