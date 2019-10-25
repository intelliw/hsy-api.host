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

            let results = { itemCount: 1, messages: [] };
            results.messages.push(super.createMessage(this.apiDatasetName, datasets));   // add to the message array

            // connect 
            await this.producerObj.connect();
            
            console.log(results.messages)

            // send the message to the topics
            let result = await this.producerObj.send({
                topic: this.kafkaTopic,
                messages: results.messages,
                acks: enums.messageBroker.ack.default,                              // default is 'leader'
                timeout: env.active.kafkajs.producer.timeout
            });

            // log output 
            log.messaging(this.kafkaTopic, result[0].baseOffset, results.messages, results.itemCount, sender);

            // disconnect
            await this.producerObj.disconnect();

        } catch (e) {
            log.exception('FeatureFlagsProducer.sendToTopic', e.message, log.ERR.event());
        }

    }

}


module.exports = FeatureFlagsProducer;
