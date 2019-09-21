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

class Producer {
    /**
     * superclass - 
     * clients of subtypes must first call extractData(), then sendToTopic()
     *  subtypes implement extractData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     producerObj": kafka.producer()
     messages": []

     constructor arguments 
    * @param {*} datasetName                                                        // enums.datasets              - e.g. pms  
    * @param {*} datasets                                                           // an array of datasets
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    constructor(datasetName, datasets, sender) {

        // create a kafka producer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,                 //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: consts.kafkajs.producer.clientId,
            retry: consts.kafkajs.retry,                                            // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: consts.kafkajs.connectionTimeout,                    // milliseconds to wait for a successful connection   
            requestTimeout: consts.kafkajs.requestTimeout                           // milliseconds to wait for a successful request.     
        })
        this.producerObj = kafka.producer();
        
        // setup instance variables
        this.messages = [];                                                         // start with an empty array and later call addMessage()  

        this.datasetName = datasetName;
        this.datasets = datasets;                                                   // array of datasets           
        this.sender = sender;                                                       // is based on the api key and identifies the source of the data. this value is added to sys.source attribute
    }

    // extracts an array of modified data items and sends these as messages to the broker 
    async sendToTopic() {

        if (this.extractData()) {

            // send the message to the topic
            let topicName = enums.messageBroker.topics.monitoring[this.datasetName];    //  lookup topic name based on datasetname           
            await this.producerObj.connect();

            let result = await this.producerObj.send({
                topic: topicName,
                messages: this.messages,
                acks: enums.messageBroker.ack.default,                                  // default is 'leader'
                timeout: consts.kafkajs.send.timeout
            })
                .catch(e => console.error(`[${consts.kafkajs.producer.clientId}] ${e.message}`, e));

            // log output
            console.log(
                // e.g. 2019-09-10 05:04:44.6630, 2 messages [monitoring.mppt:2-3, sender:S001]
                `${moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat)}, ${this.messages.length} messages [${topicName}:${result[0].baseOffset}-${Number(result[0].baseOffset) + (this.messages.length - 1)}, sender:${this.sender}]`)
                // if verbose logging on.. e.g. [ { key: '025', value: '[{"pms_id" .... 
                if (consts.environments[consts.env].log.verbose) console.log(this.messages);

            // disconnect
            await this.producerObj.disconnect();

        }
    }

    /**
     * extractData() creates an array of modified data items and returns true if successful
     * each dataset object has a common structure and an object property named after the dataset 
     * e.g. "pms": { "id": "PMS-01-001" }    
     * datasetName this is also the topic                                              // e.g. pms - 
     * datasets    object array of dataset items. 
     * each dataset item has an id and an array of data objects each with an event timestamp
     * e.g. 
            { "pms": { "id": "PMS-01-001" }, 
            "data": [
                { "time": "20190209T150006.032+0700",
                  "pack": { "id": "0241", "dock": 1, "amps": "-1.601", "temp": ["35.0", "33.0", "34.0"] },
                  "cell": { "open": [1, 6], "volts": ["3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.91"] },
                  "fet": { "open": [1, 2], "temp": ["34.1", "32.2", "33.5"] } },           
    */
    extractData() {

        let status = false
        let key;
        let message = [];

        // extract and add messages to super 
        this.datasets.forEach(dataset => {                                          // e.g. "pms": { "id": "PMS-01-001" }, "data": [ { time_local: '20190809T150006.032+0700', pack: [Object] }, ... ]

            key = dataset[this.datasetName].id;                                     // e.g. id from.. "pms": { "id": 

            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                                      // e.g. "data": [ { "time_local": "2

                // add elements into the dataset
                dataItem = this.addDatasetAttributes(key, dataItem);                // add dataset-specific attributes in subclass
                dataItem = this.addGenericAttributes(key, dataItem);                // add common attributes

                // add the message to the items buffer
                message.push(dataItem);

            });

            // add the message to the buffer
            this.addMessage(key, message);
            message = [];

        });

        status = true                                                                // todo: implement logic for status
        return status;

    }

    /* this function adds attributes common to all datasets:
    *  - id, processing time, utc time, local time, and data source 
    *  this function should be called by the subtype after adding calling its own addAttributes() 
    *  key - is a string
    *  dataItem - contains the data object e.g. "data": [ { "time_local": "2
    *  sysSource is the keyname of the apikey enum, sent in the POST request
    */
    addGenericAttributes(key, dataItem) {

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
            sys: { source: this.sender },                                        // is based on the api key and identifies the source of the data. this value is added to sys.source attribute
            time_utc: eventTimeUtc,
            time_local: eventTimeLocal,
            time_processing: processingTime
        };                                                                       

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


}

module.exports = Producer;
