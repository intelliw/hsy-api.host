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
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiDatasetName                                                               // enums.params.datasets
     * kafkaTopic                                                                   // enums.messageBroker.topics.monitoring
     * constructor arguments 
     * @param {*} apiDatasetName                                                    // enums.params.datasets              - e.g. pms       
     */
    constructor(apiDatasetName, kafkaTopic) {

        // create a kafka producer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,                 //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: consts.kafkajs.producer.clientId,
            retry: consts.kafkajs.producer.retry,                                   // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: consts.kafkajs.producer.connectionTimeout,           // milliseconds to wait for a successful connection   
            requestTimeout: consts.kafkajs.producer.requestTimeout                  // milliseconds to wait for a successful request.     
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
        await this.producerObj.connect();

        let result = await this.producerObj.send({
            topic: this.kafkaTopic,
            messages: results.messages,
            acks: enums.messageBroker.ack.default,                                  // default is 'leader'
            timeout: consts.kafkajs.producer.timeout
        })
            .catch(e => console.error(`[${consts.kafkajs.producer.clientId}] ${e.message}`, e));

        // log output               e.g. 2019-09-10 05:04:44.6630, 2 messages, 4 items [monitoring.mppt:2-3, sender:S001]
        console.log(`${moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat)}, ${results.messages.length} messages, ${results.itemCount} items [${this.kafkaTopic}:${result[0].baseOffset}-${Number(result[0].baseOffset) + (results.messages.length - 1)}] sender:${sender}`)

        // if verbose logging on..  e.g. [ { key: '025', value: '[{"pms_id" .... 
        if (consts.environments[consts.env].log.verbose) console.log(results);

        // disconnect
        await this.producerObj.disconnect();

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
                dataItem = this.addGenericAttributes(key, dataItem, sender);        // add common attributes

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
    *  key - is a string
    *  dataItem - contains the data object e.g. "data": [ { "time_local": "2
    *  sender is the keyname of the apikey enum, sent in the POST request  and identifies the source of the data. this value is added to sys.source attribute
    */
    addGenericAttributes(key, dataItem, sender) {

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
            sys: { source: sender },             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute
            time_utc: eventTimeUtc,
            time_local: eventTimeLocal,
            time_processing: processingTime
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

}

module.exports = Producer;
