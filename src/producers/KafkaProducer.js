//@ts-check
"use strict";
/**
 * ./producers/KafkaProducer.js
 *  base type for Kafka message producers  
 */
const { Kafka } = require('kafkajs');
const Producer = require('./Producer');

const env = require('../environment');
const enums = require('../environment/enums');
const log = require('../logger').log;

class KafkaProducer extends Producer {
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
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers                                       //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]                                                       // https://kafka.js.org/docs/producing   
        });

        // setup instance variables specific to KafkaProducer 
        this.producerObj = kafka.producer(env.active.kafkajs.producer);

    }

    /** implemented by subtype
    * @param {*} msgObj               // msgObj = { itemCount: 0, messages: [] };
    *                                 e.g. : { itemCount: 1,
    *                                          messages: [ 
    *                                          { key: 'TEST-01',
    *                                            value: '{"pms":{"id":"TEST-01"},"data":[{"pack":{"id":"0241","dock":1,"amps":-1.601,"temp":[35,33,34],"cell":{"open":[],"volts":[3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.91]},"fet":{"open":[1,2],"temp":[34.1,32.2]},"status":"0001"},"sys":{"source":"STAGE001"},"time_event":"2019-09-09 08:00:06.0320","time_zone":"+07:00","time_processing":"2019-12-17 04:07:20.7790"}]}' 
    *                                            } ]
    *                                         }
    * @param {*} sender               // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(msgObj, sender) {

        // [start trace] -------------------------------    
        const sp = log.SPAN.createChildSpan({ name: `${log.enums.methods.mbSendToTopic}` });    // 2do  - consumer tracing does not have a root span ..


        // send the message to the topic
        await this.producerObj.connect()                                            // try connecting         
            .then(() => this.producerObj.send({                                     //.. send    
                topic: this.writeTopic,
                messages: msgObj.messages,
                acks: enums.messageBroker.ack.all,                                  //      default is 'all'
                timeout: env.active.kafkajs.send.timeout                            //      milliseconds    
            }))
            .then(r => log.messaging(this.writeTopic, `${r[0].baseOffset}-${parseInt(r[0].baseOffset) + (msgObj.messages.length - 1)}`, msgObj.messages, msgObj.itemCount, sender))         // info = (topic, id, msgqty, itemqty, sender) {
            .then(this.producerObj.disconnect())                                    // disconnect    
            .catch(e => log.error(`${this.apiPathIdentifier} ${log.enums.methods.mbSendToTopic} Error [${this.writeTopic}]`, e));
        

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

module.exports = KafkaProducer;
