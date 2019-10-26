//@ts-check
'use strict';
/**
 * ./producers/index.js
 * 
 * producers 
 */
const env = require('../environment');
const enums = require('../environment/enums');

module.exports.KafkaProducer = require('./KafkaProducer');
module.exports.Monitoring = require('./Monitoring');
module.exports.Features = require('./Features');

// static factory method to construct a producer    
module.exports.getProducer = (apiDatasetName) => {
    let producer;
    switch (apiDatasetName) {

        // pms
        case enums.params.datasets.pms:
            producer = new this.Monitoring(enums.params.datasets.pms, env.active.topics.monitoring.pms);
            break;

        // mppt 
        case enums.params.datasets.mppt:
            producer = new this.Monitoring(enums.params.datasets.mppt, env.active.topics.monitoring.mppt);
            break;

        // inverter 
        case enums.params.datasets.inverter:
            producer = new this.Monitoring(enums.params.datasets.inverter, env.active.topics.monitoring.inverter);
            break;

        // logging feature - communicates logging configuration changes from host to consumer instances  
        case enums.params.datasets.logging:
            producer = new this.Features(enums.params.datasets.logging, env.active.topics.features.logging);
            break;

    }

    return producer;
}