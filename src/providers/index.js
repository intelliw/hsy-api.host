//@ts-check
'use strict';
/**
 * ./providers/index.js
 * 
 * providers 
 */
const env = require('../environment');
const enums = require('../environment/enums');

 // kafka or pubsub - depending on active configs
module.exports.ActiveMsgPublisher = require(`${env.active.messagebroker.provider == enums.messageBroker.providers.pubsub ? './PubSubPublisher' : './KafkaPublisher'}`);

module.exports.Publisher = require('./Publisher');
module.exports.KafkaPublisher = require('./KafkaPublisher');
module.exports.PubSubPublisher = require('./PubSubPublisher');

