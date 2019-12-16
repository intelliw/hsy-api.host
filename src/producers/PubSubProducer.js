//@ts-check
"use strict";
/**
 * ./producers/PubSubProducer.js
 *  base type for Kafka message producers  
 */
const {PubSub} = require('@google-cloud/pubsub');
const Producer = require('./Producer');

const env = require('../environment');
const enums = require('../environment/enums');
const log = require('../logger').log;

class PubSubProducer extends Producer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiPathIdentifier                                                            // enums.params.datasets
     * kafkaTopic                                                                   // env.active.messagebroker.topics.monitoring
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                 // enums.params.datasets              - e.g. pms       
     */
    constructor(apiPathIdentifier, writeTopic) {

        super(apiPathIdentifier, writeTopic);

        // create a kafka producer
        const pubsub = new PubSub();

        // setup instance variables specific to PubSubProducer 
        this.producerObj = pubsub;

    }

    /** implemented by subtype
    * @param {*} msgObj                                                             // e.g. msgObj = { itemCount: 0, messages: [] };
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(msgObj, sender) {

        // [start trace] -------------------------------    
        const sp = log.TRACE.createChildSpan({ name: `${log.enums.methods.kafkaSendToTopic}` });    // 2do  - consumer tracing does not have a root span ..

        // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
        const dataBuffer = Buffer.from(msgObj.messages);

        // send the message to the topic
        await this.producerObj.topic(this.writeTopic).publish(dataBuffer)
            .then(messageId => log.messaging(this.writeTopic, messageId, msgObj.messages, msgObj.itemCount, sender))         // info = (topic, offset, msgqty, itemqty, sender) {
            .catch(e => log.error(`${this.apiPathIdentifier} ${log.enums.methods.kafkaSendToTopic} Error [${this.writeTopic}]`, e));
        // console.log(`message id:  ${messageId}`);

        // [end trace] ---------------------------------    
        sp.endSpan();
        
        // send the message to the topic
        // log.data("monitoring", "pms", "TEST-09", []); 
        // log.exception('sendToTopic', 'there was an error in ' + env.active.kafkajs.producer.clientId, log.ERR.event()); 
        // log.error('Unexpected', new Error('sendToTopic connection')); 
        // log.trace(log.enums.labels.watchVar, 'id', log.ERR.event());
        // log.trace(log.enums.labels.watchVar, 'id');

    }

}

module.exports = PubSubProducer;
