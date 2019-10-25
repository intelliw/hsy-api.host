//@ts-check
"use strict";
/**
 * ./producers/KafkaProducer.js
 *  base type for Kafka message producers  
 */
const { Kafka } = require('kafkajs');
const KafkaProducer = require('./KafkaProducer');

const enums = require('../environment/enums');
const consts = require('../host/constants');
const utils = require('../environment/utils');

const env = require('../environment');
const log = require('../host').log;

const errors = env.errors;

const moment = require('moment');

class FeatureFlagsProducer extends KafkaProducer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiDatasetName                                                               // enums.params.datasets
     * kafkaTopic                                                                   // env.active.topics.monitoring
     * constructor arguments 
     * @param {*} apiDatasetName                                                    // enums.params.datasets              - e.g. pms       
     */
    constructor(apiDatasetName, kafkaTopic) {

        super(apiDatasetName, kafkaTopic);

    }

    /** extracts an array of modified data items and sends these as messages to the broker 
    * @param {*} datasets                                                           // an array of datasets
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(datasets, sender) {

        // send the message to the topics
        try {
            // connect 
            await this.producerObj.connect();

            // send the message to the topics
            let result = await this.producerObj.send({
                topic: this.kafkaTopic,
                messages: results.messages,
                acks: enums.messageBroker.ack.default,                              // default is 'leader'
                timeout: env.active.kafkajs.producer.timeout
            });

            // log output                                                           // e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001
            log.messaging(this.kafkaTopic, result[0].baseOffset, results.messages, results.itemCount, sender);         // info = (topic, offset, msgqty, itemqty, sender) {
            // log.data("monitoring", "pms", "TEST-09", []); 
            // log.exception('sendToTopic', 'there was an error in ' + env.active.kafkajs.producer.clientId, log.ERR.event()); 
            // log.error('Unexpected', new Error('sendToTopic connection')); 
            log.trace('@1', log.ERR.event());

            // disconnect
            await this.producerObj.disconnect();

        } catch (e) {
            log.exception('FeatureFlagsProducer.sendToTopic', e.message, log.ERR.event());
        }

    }

}


module.exports = FeatureFlagsProducer;
