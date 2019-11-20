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
     * apiPathIdentifier                                                            // enums.params.datasets
     * kafkaTopic                                                                   // env.active.topics.monitoring
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                 // enums.params.datasets              - e.g. pms       
     */
    constructor(apiPathIdentifier, writeTopic) {

        // create a kafka producer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers                                       //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]                                                       // https://kafka.js.org/docs/producing   
        });

        // setup instance variables
        this.producerObj = kafka.producer(env.active.kafkajs.producer);
        this.apiPathIdentifier = apiPathIdentifier;
        this.writeTopic = writeTopic;

    }

    /** implemented by subtype
    * @param {*} msgObj                                                             // e.g. msgObj = { itemCount: 0, messages: [] };
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(msgObj, sender) {

        // [start trace] -------------------------------    
        const sp = log.TRACE.createChildSpan({ name: `${log.enums.methods.kafkaSendToTopic}` });    // 2do  - consumer tracing does not have a root span ..


        // send the message to the topic
        await this.producerObj.connect()                                            // try connecting         
            .then(() => this.producerObj.send({                                     //.. send    
                topic: this.writeTopic,
                messages: msgObj.messages,
                acks: enums.messageBroker.ack.all,                                  //      default is 'all'
                timeout: env.active.kafkajs.send.timeout                            //      milliseconds    
            }))
            .then(r => log.messaging(this.writeTopic, r[0].baseOffset, msgObj.messages, msgObj.itemCount, sender))         // info = (topic, offset, msgqty, itemqty, sender) {
            .then(this.producerObj.disconnect())                                    // disconnect    
            .catch(e => log.error(`${this.apiPathIdentifier} ${log.enums.methods.kafkaSendToTopic} Error [${this.writeTopic}]`, e));
        

        // [end trace] ---------------------------------    
        sp.endSpan();
        
        // send the message to the topic
        // log.data("monitoring", "pms", "TEST-09", []); 
        // log.exception('sendToTopic', 'there was an error in ' + env.active.kafkajs.producer.clientId, log.ERR.event()); 
        // log.error('Unexpected', new Error('sendToTopic connection')); 
        // log.trace(log.enums.labels.watchVar, 'id', log.ERR.event());
        // log.trace(log.enums.labels.watchVar, 'id');

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
