//@ts-check
"use strict";
/**
 * ./producers/Producer.js
 *  base type for Kafka message producers  
 */
const { Kafka } = require('kafkajs');

const enums = require('../host/enums');
const consts = require('../host/constants');
const moment = require('moment');

const KAFKA_DEFAULT_ACK = enums.messageBroker.ack.leader;

class Producer {
    /**
    instance attributes:  
     "producerObj": kafka.producer()
     "_messages": []
     "clientId":  'devices.datasets'
     "topic":      enums.messageBroker.topics..
     "ack":        enums.messageBroker.ack.. 

     constructor arguments 
    * @param {*} clientId           //  consts.messaging.clientid   - e.g. devices.datasets
    * @param {*} topic              //  enums.messageBroker.topics     - e.g. monitoring_devices_MPPTSNMP
    * @param {*} ack                //  enums.messageBroker.ack        
    */
    constructor(clientId, topic, ack) {

        // create the producer
        const kafka = new Kafka({
            brokers: consts.KAFKA_BROKERS,              //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: clientId,
        })
        this.producerObj = kafka.producer();

        // setup instance variables
        this._messages = [];                            // start with an empty array and use addMessages() 
        this.topic = topic;
        this.clientId = clientId;
        this.ack = ack ? ack: KAFKA_DEFAULT_ACK;        
    }
    // implemented by subtype, to extract data and call super's addMessage with the key, dataItem and optional header
    extractData() {
    }

 /* adds a message to the message array
    * key is a string
    * dataItem contains time headers and a data array of name-value objects
    *   { "processingTime": "20190625T104257.097", "eventTime": "20190209T150006.032-0700". "data" : ["name": "vcell01", "value": "99", ..]   }     
    * headers are a json object (note: kafkajs produces a byte array for headers unlike messages which are a string buffer
    *   e.g. { 'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67', system-id': 'my-system' }  
    * this function adds a processing time to the headers
    */
    addMessage(key, dataItem, headers) {
        
        // prepend a processing time to the dataitem
        let processingTime = moment.utc().format(consts.periodDatetimeISO.instant);
        dataItem.processingTime = processingTime;

        // create the message
        let message = {
            key: key,
            value: JSON.stringify(dataItem)
            };
        if (headers) {
            message.headers = JSON.stringify(headers);
        }
        this._messages.push(message);       // add to the message array
    }
        
    async sendToTopic() {

        await this.producerObj.connect();

        let result = await this.producerObj.send({
            topic: this.topic,
            messages: this._messages,
            acks: this.ack,
        })
            .catch(e => console.error(`[${this.clientId}] ${e.message}`, e));
        
        console.log(`${this._messages.length} messages [offset: ${result[0].baseOffset}-${Number(result[0].baseOffset) + (this._messages.length - 1)}]`)            
        
        await this.producerObj.disconnect();        

    }

    
}

module.exports = Producer;
