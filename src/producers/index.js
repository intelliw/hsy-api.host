//@ts-check
'use strict';
/**
 * ./producers/index.js
 * 
 * producers 
 */
const env = require('../environment');
const enums = require('../environment/enums');

// kafka or pubsub - depending on active configs
module.exports.ActiveMsgProducer = require(`${env.active.messagebroker.provider == enums.messageBroker.providers.pubsub ? './PubSubProducer' : './KafkaProducer'}`);

module.exports.Producer = require('./Producer');
module.exports.KafkaProducer = require('./KafkaProducer');
module.exports.PubSubProducer = require('./PubSubProducer');
module.exports.Monitoring = require('./Monitoring');
module.exports.Feature = require('./Feature');

// static factory method to construct producers    
module.exports.getProducer = (apiPathIdentifier) => {
    let producer;
    switch (apiPathIdentifier) {

        // pms
        case enums.params.datasets.pms:
            producer = new this.Monitoring(enums.params.datasets.pms, env.active.messagebroker.topics.monitoring.pms);
            break;

        // mppt 
        case enums.params.datasets.mppt:
            producer = new this.Monitoring(enums.params.datasets.mppt, env.active.messagebroker.topics.monitoring.mppt);
            break;

        // inverter 
        case enums.params.datasets.inverter:
            producer = new this.Monitoring(enums.params.datasets.inverter, env.active.messagebroker.topics.monitoring.inverter);
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