//@ts-check
"use strict";
/**
 * ./producers/PubSubProducer.js
 *  base type for Kafka message producers  
 */
const { PubSub } = require('@google-cloud/pubsub');
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

        // create a pubsub producer
        const pubsub = new PubSub();

        // setup instance variables specific to PubSubProducer 
        this.producerObj = pubsub;

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


        let dataBuffer, dataAttributes;

        // [start trace] -------------------------------    
        const sp = log.TRACE.createChildSpan({ name: `${log.enums.methods.mbSendToTopic}` });           // 2do  - consumer tracing does not have a root span ..


        // create microbatching publisher                                                               //note:  miocrobatch settings apply only for large msgObj.messages[] where you call batchPub.publish multiple times. The microbatch prevents client libs from sending messages to pubsub.             
        const BATCH_OPTIONS = env.active.pubsub.batching;
        BATCH_OPTIONS.maxMessages = msgObj.messages.length;                                             // number of message to include in a batch before client library sends to topic. If batch size is msobj.messages.length batch will go to server after all are published 

        const batchPub = this.producerObj.topic(this.writeTopic, { batching: BATCH_OPTIONS });
        let messageIds = [];

        // send each message to the topic - pubsub will batch and send to server after all are published
        for (let i = 0; i < msgObj.messages.length; i++) {

            (async () => {

                dataBuffer = Buffer.from(msgObj.messages[i].value);                                             // value attribute if kafka 
                dataAttributes = {
                    key: msgObj.messages[i].key
                };

                // publish message 
                await batchPub.publish(dataBuffer, dataAttributes, (e, messageId) => {
                    // log errors
                    if (e) {
                        log.error(`${this.apiPathIdentifier} ${log.enums.methods.mbSendToTopic} Error [${this.writeTopic}]`, e);

                    // log messaging once only, after all messages in this loop have been published 
                    } else {
                        messageIds.push(messageId);
                        if (i == (msgObj.messages.length - 1)) {
                            log.messaging(this.writeTopic, messageIds, msgObj.messages, msgObj.itemCount, sender)     // info = (topic, id, msgqty, itemqty, sender) {;
                        };
                    };

                });

            })().catch(e => log.error(`${this.apiPathIdentifier} ${log.enums.methods.mbSendToTopic} Error (async) [${this.writeTopic}]`, e));
        }


        // [end trace] ---------------------------------    
        sp.endSpan();

    }

}

module.exports = PubSubProducer;
