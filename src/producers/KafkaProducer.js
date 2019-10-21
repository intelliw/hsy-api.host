//@ts-check
"use strict";
/**
 * ./producers/KafkaProducer.js
 *  base type for Kafka message producers  
 */
const { Kafka } = require('kafkajs');

const enums = require('../environment/enums');
const consts = require('../host/constants');
const utils = require('../environment/utils');

const env = require('../environment');
const log = require('../logger').log;

const errors = env.errors;

const moment = require('moment');

class KafkaProducer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiDatasetName                                                               // enums.params.datasets
     * kafkaTopic                                                                   // env.active.topics.monitoring
     * constructor arguments 
     * @param {*} apiDatasetName                                                    // enums.params.datasets              - e.g. pms       
     */
    constructor(apiDatasetName, kafkaTopic) {

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
        this.apiDatasetName = apiDatasetName;
        this.kafkaTopic = kafkaTopic;
    }

    /** extracts an array of modified data items and sends these as messages to the broker 
    * @param {*} datasets                                                           // an array of datasets
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(datasets, sender) {

        // get the data 
        let results = this.extractData(datasets, sender);                           // e.g. results: { itemCount: 9, messages: [. . .] }

        // send the message to the topics
        try {
            // connect 
            await this.producerObj.connect();

            // send the message to the topics
            let result = await this.producerObj.send({
                topic: this.kafkaTopic,
                messages: results.messages,
                acks: enums.messageBroker.ack.default,                              // default is 'leader'
                timeout: env.active.kafkajs.producer.timeout
            });

            // log output                                                           // e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001
            log.messaging.write(this.kafkaTopic, result[0].baseOffset, results.messages, results.itemCount, sender);         // info = (topic, offset, msgqty, itemqty, sender) {
            //log.data.write("monitoring", "pms", "TEST-09", []); 

            // disconnect
            await this.producerObj.disconnect();

        } catch (e) {
            console.error(`>>>>>> CONNECT ERROR: [${env.active.kafkajs.producer.clientId}] ${e.message}`, e)
        }

    }

    /**
     * creates an array of kafka messages and returns them in a results object
     * datasets - object array of dataset items. 
     *  each dataset item has an id and an array of data objects
     *  each data object has a time_local event timestamp
     *  dataset objects have a common structure
     *  the id property must be in an object named after the dataset 
     *      e.g. { "pms": { "id": "PMS-01-001" },  "data": [ { "time_local": "20190209T150006.032+0700", ..]
     * the returned results object contains these properties
     *  itemCount  - a count of the total number of dataitems in all datasets / message
     *  messages[] - array of kafka messages, each message.value contains a dataset with modified data items
     *      e.g. { itemCount: 9, messages: [. . .] }
    */
    extractData(datasets, sender) {

        let key
        let dataItems = [];
        let dataItemCount = 0;
        let results = { itemCount: 0, messages: [] };

        // extract and add messages to results 
        datasets.forEach(dataset => {                                               // e.g. "pms": { "id": "PMS-01-001" }, "data": [ { time_local: '20190809T150006.032+0700', pack: [Object] }, ... ]

            key = dataset[this.apiDatasetName].id;                                  // e.g. id from.. "pms": { "id": 

            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                                      // e.g. "data": [ { "time_local": "2

                // add elements into the dataset
                dataItem = this.addGenericAttributes(dataItem, sender);        // add common attributes

                // add the message to the items buffer
                dataItems.push(dataItem);

            });

            // replace data array with new dataItems 
            dataset.data = dataItems;
            dataItemCount += dataItems.length;
            dataItems = [];

            // add the modified dataset to the message buffer
            results.messages.push(this.createMessage(key, dataset));                        // add to the message array

        });

        results.itemCount = dataItemCount;
        return results;

    }

    /* this function adds attributes common to all datasets:
    *  dataItem - contains the data object e.g. "data": [ { "time_local": "2
    *  sender is the keyname of the apikey enum, sent in the POST request  and identifies the source of the data. this value is added to sys.source attribute
    */
    addGenericAttributes(dataItem, sender) {

        // delete time_local - this will be replaced
        let eventTime = dataItem.time_local;                                        // "data": [ { "time_local": "20190209T150017.020+0700",
        delete dataItem.time_local;                                                 // addMessage will prepend 3 standard time attributes to the dataitem

        /* append event time, zone, processing time to the data item
        note that we convert time_local to bigqueryZonelessTimestampFormat which does not have trailing offset hours 
        - this is done as part of date validation in this stage 
        - but it not required by bigquery as it will convert local time to utc if submitted with a zone offset
        */

        dataItem = {
            ...dataItem,
            sys: { source: sender },             // is based on the apikey from the sender and identifies the source of the data. this value is added to sys.source attribute
            time_event: moment.utc(eventTime).format(consts.dateTime.bigqueryZonelessTimestampFormat),
            time_zone: utils.datetimeZoneOffset(eventTime),
            time_processing: moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat)
        };

        return dataItem;

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

    // static factory method to construct a monitoring producer    
    static getProducer(apiDatasetName) {
        let producer;
        switch (apiDatasetName) {

            // pms
            case enums.params.datasets.pms:
                producer = new KafkaProducer(enums.params.datasets.pms, env.active.topics.monitoring.pms);
                break;

            // mppt 
            case enums.params.datasets.mppt:
                producer = new KafkaProducer(enums.params.datasets.mppt, env.active.topics.monitoring.mppt);
                break;

            // inverter 
            case enums.params.datasets.inverter:
                producer = new KafkaProducer(enums.params.datasets.inverter, env.active.topics.monitoring.inverter);
                break;

        }
        return producer;
        
    }
}


module.exports = KafkaProducer;
