//@ts-check
"use strict";
/**
 * ./producers/KafkaProducer.js
 *  base type for Kafka message producers  
 */
const { Kafka } = require('kafkajs');

const env = require('../environment');
const enums = require('../environment/enums');
const log = require('../logger').log;

class KafkaProducer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiPathIdentifier                                                               // enums.params.datasets
     * kafkaTopic                                                                   // env.active.topics.monitoring
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                    // enums.params.datasets              - e.g. pms       
     */
    constructor(apiPathIdentifier, kafkaTopic) {

        // create a kafka producer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers,                 //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: env.active.kafkajs.producer.clientId,
            retry: env.active.kafkajs.producer.retry,                                   // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: env.active.kafkajs.producer.connectionTimeout,           // milliseconds to wait for a successful connection   
            requestTimeout: env.active.kafkajs.producer.requestTimeout                  // milliseconds to wait for a successful request.     
        });

        // instance variables
        this.producerObj = kafka.producer();
        this.apiPathIdentifier = apiPathIdentifier;
        this.kafkaTopic = kafkaTopic;
    }

    /** implemented by subtype
    * @param {*} msgObj                                                             // e.g. msgObj = { itemCount: 0, messages: [] };
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(msgObj, sender) {


        // send the message to the topics
        try {

            // connect 
            await this.producerObj.connect();

            // send the message to the topics
            let result = await this.producerObj.send({
                topic: this.kafkaTopic,
                messages: msgObj.messages,
                acks: enums.messageBroker.ack.default,                              // default is 'leader'
                timeout: env.active.kafkajs.producer.timeout
            });

            // log output                                                           // e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001
            log.messaging(this.kafkaTopic, result[0].baseOffset, msgObj.messages, msgObj.itemCount, sender);         // info = (topic, offset, msgqty, itemqty, sender) {
            // log.data("monitoring", "pms", "TEST-09", []); 
            // log.exception('sendToTopic', 'there was an error in ' + env.active.kafkajs.producer.clientId, log.ERR.event()); 
            // log.error('Unexpected', new Error('sendToTopic connection')); 
            // log.trace('@1', log.ERR.event());
            // log.trace('@1');

            // disconnect
            await this.producerObj.disconnect();

        } catch (e) {
            log.error(`${this.apiPathIdentifier} sendToTopic`, e);
        }

    }

    /* creates and returns a message
    * key - is a string
    * data - contains the message value 
    * headers - a json object e.g. { 'corsrelation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67', system-id': 'my-system' }  
    *        (note: kafkajs produces a byte array for headers unlike messages which are a string buffer
    */
    createMessage(key, data, headers) {

        // create the message
        let message = {
            key: key,
            value: JSON.stringify(data)
        };

        if (headers) {
            message.headers = JSON.stringify(headers);
        }

        return message;
    }

}


module.exports = KafkaProducer;
