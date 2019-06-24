//@ts-check
"use strict";
/**
 * ./dataloggers/Producer.js
 *  base type for Kafka message producers  
 */
const { Kafka } = require('kafkajs');

const enums = require('../host/enums');
const consts = require('../host/constants');
const utils = require('../host/utils');

const KAFKA_DEFAULT_ACK = enums.dataLogger.ack.leader;

class Producer {
    /**
    instance attributes:  
     "_messages": []
     "producer": kafka.producer()
     "topic": 
     "ack": 

     constructor arguments 
    * @param {*} clientId           //  consts.messaging.clientid   - e.g. devices.datasets
    * @param {*} topic              //  enums.dataLogger.topics     - e.g. monitoring_devices_MPPTSNMP
    * @param {*} ack                //  enums.dataLogger.ack        
    */
    constructor(topic, clientId, ack) {

        // create the producer
        const kafka = new Kafka({
            brokers: consts.KAFKA_BROKERS,              //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: clientId,
        })
        this.producer = kafka.producer();

        this._messages = [];                            // starts with an empty array
        this.topic = topic;
        this.clientId = clientId;
        this.ack = ack ? ack: KAFKA_DEFAULT_ACK;        
    }

    // adds a message to the message array
    addMessage(key, value, headers) {
       
        // create the message
        let message = {
            key: key,
            value: JSON.stringify(value)
            };
        if (headers) {
            message.headers = headers;
        }
        // add it to the message array
        this._messages.push(message);

    }

    sendMessages() {
       
        send (this.producer, this.topic, this.clientId, this._messages, this.ack);
    }

    
}

async function send (producer, topic, clientId, messages, ack) {
        
    await producer.connect();

    let result = await producer.send({
        topic: topic,
        messages: messages,
        acks: ack,
    })
        .catch(e => console.error(`[${clientId}] ${e.message}`, e));
        
    console.log(result ? `${messages.length} [${result[0].baseOffset}-${Number(result[0].baseOffset) + (messages.length - 1)}]` : 'none');
    
    await producer.disconnect();
    
    // console.log(messages);


}

module.exports = Producer;
