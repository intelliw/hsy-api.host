//@ts-check
'use strict';
/**
 * ./publishers/index.js
 * 
 */
const env = require('../environment');
const enums = require('../environment/enums');

 // kafka or pubsub - depending on active configs

module.exports.Publisher = require('./Publisher');
module.exports.KafkaPublisher = require('./KafkaPublisher');
module.exports.PubSubPublisher = require('./PubSubPublisher');

// active publisher singleton instance - kafka or pubsub - depending on active env configs
const pub = new (require(`${env.active.messagebroker.provider == enums.messageBroker.providers.pubsub ? './PubSubPublisher' : './KafkaPublisher'}`));
module.exports.pub = pub;
