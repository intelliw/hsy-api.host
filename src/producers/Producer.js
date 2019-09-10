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

const KAFKA_ACK = enums.messageBroker.ack.default;                                  // default is 'leader'

class Producer {
    /**
     * superclass - 
     * clients of subtypes must first call extractData(), then sendToTopic()
     *  subtypes implement extractData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     producerObj": kafka.producer()
     messages": []
     clientId":  'devices.datasets'

     constructor arguments 
    * @param {*} datasetName                                                        // enums.datasets              - e.g. pms  
    * @param {*} datasets                                                           // an array of datasets
    * @param {*} sysSource                                                          // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    * @param {*} clientId                                                           // consts.messaging.clientid   - e.g. devices.datasets
    */
    constructor(datasetName, datasets, sysSource, clientId) {

        // create a kafka producer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,                 //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: clientId,
            retry: consts.kafkajs.retry,                                            // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: consts.kafkajs.connectionTimeout,                    // milliseconds to wait for a successful connection   
            requestTimeout: consts.kafkajs.requestTimeout                           // milliseconds to wait for a successful request.     
        })
        this.producerObj = kafka.producer();

        // setup instance variables
        this.messages = [];                                                         // start with an empty array and later call addMessage()  

        this.datasetName = datasetName; 
        this.datasets = datasets;                                                   // array of datasets           
        this.sysSource = sysSource;                                                 // is based on the api key and identifies the source of the data. this value is added to sys.source attribute
        this.clientId = clientId;                                                   // enums.messageBroker.producers.clientId
    }

    // implemented by subtype: extracts data and calls super's sendToTopic() with the key, dataItems and optional header, the sysSource is the keyname of the apikey enum, sent in the POST request
    extractData(d) {
    }

    /* this function adds attributes common to all datasets:
    *  - id, processing time, utc time, local time, and data source 
    *  this function should be called by the subtype after adding calling its own addAttributes() 
    *  key - is a string
    *  dataItem - contains the data object e.g. "data": [ { "time_local": "2
    */
    addAttributes(key, dataItem) {

        // extract eventTime and delete the attribute - timestamps are added in the Producer supertype's addMessage() method 
        let eventTime = dataItem.time_local;                                        // "data": [ { "time_local": "20190209T150017.020+0700",
        delete dataItem.time_local;                                                 // addMessage will prepend 3 standard time attributes to the dataitem

        /* prepend sys.source, event utc time, event local time, processing time, to the dataitem to the data item
        note that we use a timeformat without trailing offset hours (bigqueryZonelessTimestampFormat)
        to force bigquery to store local time without converting to utc
        */
        let processingTime = moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat);
        let eventTimeUtc = utils.datetimeToUTC(eventTime, consts.dateTime.bigqueryZonelessTimestampFormat);
        let eventTimeLocal = utils.datetimeToLocal(eventTime, consts.dateTime.bigqueryZonelessTimestampFormat);

        dataItem = {
            ...dataItem,
            sys: { source: this.sysSource },                                        // is based on the api key and identifies the source of the data. this value is added to sys.source attribute
            time_utc: eventTimeUtc,
            time_local: eventTimeLocal,
            time_processing: processingTime
        };                                                                          // append the data last

        return dataItem;
    }

    /* adds a message to the message array
    * key - is a string
    * data - contains the message value 
    * headers - a json object (note: kafkajs produces a byte array for headers unlike messages which are a string buffer
    *   e.g. { 'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67', system-id': 'my-system' }  
    * this function prepends the id, processing time, utc time, local time, and data source - to the data object
    */
    addMessage(key, data, headers) {

        // create the message
        let message = {
            key: key,
            value: JSON.stringify(data)
        };

        if (headers) {
            message.headers = JSON.stringify(headers);
        }
        this.messages.push(message);                                                // add to the message array
    }

    /* sends the message to the broker 
    */
    async sendToTopic() {

        // send the message to the topic
        let topicName = enums.messageBroker.topics.monitoring[this.datasetName];    //  lookup topic name based on datasetname           
        await this.producerObj.connect();

        let result = await this.producerObj.send({
            topic: topicName,
            messages: this.messages,
            acks: KAFKA_ACK,
            timeout: consts.kafkajs.send.timeout
        })
            .catch(e => console.error(`[${this.clientId}] ${e.message}`, e));
            
        console.log(`${moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat)}, ${this.messages.length} messages [${topicName}, offset: ${result[0].baseOffset}-${Number(result[0].baseOffset) + (this.messages.length - 1)}]`)
        await this.producerObj.disconnect();

    }

}

module.exports = Producer;
