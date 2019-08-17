//@ts-check
"use strict";
/**
 * ./producers/Producer.js
 *  base type for Kafka message producers  
 */
const { Kafka } = require('kafkajs');

const enums = require('../host/enums');
const consts = require('../host/constants');
const utils = require('../host/utils');

const moment = require('moment');

const KAFKA_DEFAULT_ACK = enums.messageBroker.ack.leader;

class Producer {
    /**
     * superclass - 
     * clients of subtypes must first call extractData(), then sendToTopic()
     *  subtypes implement extactData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     "producerObj": kafka.producer()
     "_messages": []
     "clientId":  'devices.datasets'
     "ack":        enums.messageBroker.ack.. 

     constructor arguments 
    * @param {*} clientId           //  consts.messaging.clientid   - e.g. devices.datasets
    * @param {*} topic              //  enums.datasets              - e.g. pms
    * @param {*} ack                //  enums.messageBroker.ack        
    */
    constructor(clientId, ack) {
        
        // create the producer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,              //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: clientId,
            retry: consts.kafkajs.retry,                                         // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: consts.kafkajs.connectionTimeout,                 // milliseconds to wait for a successful connection   
            requestTimeout: consts.kafkajs.requestTimeout                        // milliseconds to wait for a successful request.     
        })
        this.producerObj = kafka.producer();

        // setup instance variables
        this._messages = [];                            // start with an empty array and later call addMessage() 
        this.clientId = clientId;
        this.ack = ack ? ack : KAFKA_DEFAULT_ACK;
    }

    // implemented by subtype: extracts data and calls super's (this) addMessage with the key, dataItem and optional header
    extractData(datasetName, datasets) {
    }

    /* adds a message to the message array
    * key is a string
    * dataItem contains the message value 
    * headers are a json object (note: kafkajs produces a byte array for headers unlike messages which are a string buffer
    *   e.g. { 'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67', system-id': 'my-system' }  
    * this function prepends the processing time, utc time, local time, and the id - to the data object
    */
    addMessage(key, data, eventTime, headers) {
        
        // prepare time values
        const formatUtc = consts.dateTime.bigqueryTimestampFormat + consts.dateTime.utcZeroOffset;      // UTC 

        let processingTime = moment.utc().format(formatUtc);
        let eventTimeUtc = utils.datetimeToUTC(eventTime);
        let eventTimeLocal = utils.datetimeToLocal(eventTime);
        
        // console.log(`${eventTime} | UTC:${eventTimeUtc} | Local:${eventTimeLocal}`);

        // prepend processing time, utc time, local time, and id to the dataitem to the data item
        data = { 
                  time_processing_utc: processingTime,                      
                  time_utc: eventTimeUtc,
                  time_local: eventTimeLocal,
                  id: key,
               ...data };                                                       // append the data last
        
        // console.log(JSON.stringify(data)); 

        // create the message
        let message = {
            key: key,
            value: JSON.stringify(data)
        };
        
        if (headers) {
            message.headers = JSON.stringify(headers);
        }
        this._messages.push(message);       // add to the message array
    }

    /* sends the message to the broker
        "topic":      enums.messageBroker.topics..
    */
    async sendToTopic(topic) {

        await this.producerObj.connect();

        let result = await this.producerObj.send({
            topic: topic,
            messages: this._messages,
            acks: this.ack,
        })
            .catch(e => console.error(`[${this.clientId}] ${e.message}`, e));

        console.log(`${this._messages.length} messages [${topic}, offset: ${result[0].baseOffset}-${Number(result[0].baseOffset) + (this._messages.length - 1)}]`)

        await this.producerObj.disconnect();

    }


}

module.exports = Producer;
