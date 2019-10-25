//@ts-check
'use strict';
/**
 * ./producers/index.js
 * 
 * producers 
 */
module.exports.KafkaProducer = require('./KafkaProducer');
module.exports.MonitoringProducer = require('./MonitoringProducer');
module.exports.FeatureFlagsProducer = require('./FeatureFlagsProducer');

 // static factory method to construct a monitoring producer    
module.exports.getProducer = (apiDatasetName) => {
    let producer;
    switch (apiDatasetName) {

        // pms
        case enums.params.datasets.pms:
            producer = new producers.MonitoringProducer(enums.params.datasets.pms, env.active.topics.monitoring.pms);
            break;

        // mppt 
        case enums.params.datasets.mppt:
            producer = new producers.MonitoringProducer(enums.params.datasets.mppt, env.active.topics.monitoring.mppt);
            break;

        // inverter 
        case enums.params.datasets.inverter:
            producer = new producers.MonitoringProducer(enums.params.datasets.inverter, env.active.topics.monitoring.inverter);
            break;

        // logging feature - communicates logging configuration changes from host to consumer instances  
        case enums.params.datasets.logging:
            producer = new producers.FeatureFlagsProducer(enums.params.datasets.logging, env.active.topics.features.logging);
            break;

    }
    return producer;
}