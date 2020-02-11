//@ts-check
'use strict';
/**
 * ./producers/index.js
 * 
 * producers 
 */
const env = require('../environment');
const enums = require('../environment/enums');

module.exports.Producer = require('./Producer');

module.exports.MonitoringPms = require('./MonitoringPms');
module.exports.MonitoringMppt = require('./MonitoringMppt');
module.exports.MonitoringInverter = require('./MonitoringInverter');

module.exports.Feature = require('./Feature');

// static factory method to construct producers    
module.exports.getProducer = (apiPathIdentifier) => {
    let producer;
    switch (apiPathIdentifier) {

        // pms
        case enums.params.datasets.pms:
            producer = new this.MonitoringPms();
            break;

        // mppt 
        case enums.params.datasets.mppt:
            producer = new this.MonitoringMppt();
            break;

        // inverter 
        case enums.params.datasets.inverter:
            producer = new this.MonitoringInverter();
            break;

        // logging feature - communicates logging configuration changes from host to consumer instances  
        case enums.paths.api.logging:
            producer = new this.Feature(enums.paths.api.logging, env.active.messagebroker.topics.system.feature);
            break;

        // feature toggles
        case enums.paths.api.features:
            producer = new this.Feature(enums.paths.api.features, env.active.messagebroker.topics.system.feature);
            break;

    }

    return producer;
}