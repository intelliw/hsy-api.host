//@ts-check
"use strict";
/**
 * ./producers/Monitoring.js
 *  base type for Kafka message producers  
 */
const KafkaProducer = require('./KafkaProducer');

const consts = require('../host/constants');
const utils = require('../environment/utils');
const log = require('../logger').log;

const moment = require('moment');

class Monitoring extends KafkaProducer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiPathIdentifier                                                               // enums.params.datasets
     * kafkaTopic                                                                   // env.active.topics.monitoring
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                    // enums.params.datasets              - e.g. pms       
     */
    constructor(apiPathIdentifier, kafkaTopic) {

        super(apiPathIdentifier, kafkaTopic);

    }

    /** extracts an array of modified data items and sends these as messages to the broker 
    * @param {*} datasets                                                           // an array of datasets
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(data, sender) {

        // send the message to the topics
        try {

            // get the data     - e.g. msgObj = { itemCount: 0, messages: [] };
            let msgObj = this.extractData(data, sender);                           // e.g. results: { itemCount: 9, messages: [. . .] }
            super.sendToTopic(msgObj, sender);

        } catch (e) {
            log.error(`${this.apiPathIdentifier} sendToTopic`, e);
        }
        
    }

    /**
     * creates an array of kafka messages and returns them in a results object
     *  data - object array of dataset items. 
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

            key = dataset[this.apiPathIdentifier].id;                               // e.g. id from.. "pms": { "id": 

            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                                      // e.g. "data": [ { "time_local": "2

                // add elements into the dataset
                let newDataItem = this.addGenericAttributes(dataItem, sender);      // add common attributes

                // add the message to the items buffer
                dataItems.push(newDataItem);

            });

            // replace data array with new dataItems 
            dataset.data = dataItems;
            dataItemCount += dataItems.length;
            dataItems = [];

            // add the modified dataset to the message buffer
            results.messages.push(super.createMessage(key, dataset));               // add to the message array

        });

        results.itemCount = dataItemCount;
        return results;

    }

    /* this function adds attributes common to all datasets:
    *   append event time, zone, and processing time to the data item
    *   dataItem - contains the data object e.g. "data": [ { "time_local": "2
    *  note that we convert time_local to bigqueryZonelessTimestampFormat which does not have trailing offset hours 
    *   - this is done as part of date validation in this stage 
    *   - but it not required by bigquery as it will convert local time to utc if submitted with a zone offset
    *  sender is the keyname of the apikey enum, sent in the POST request  and identifies the source of the data. this value is added to sys.source attribute
    */
    addGenericAttributes(dataItem, sender) {

        // create a new dataitem
        let newDataItem = utils.clone(dataItem);                // clone the object before any modifications, to prevent errors due to object re-referencing 

        // add standard attributes
        let eventTime = newDataItem.time_local;                 // "data": [ { "time_local": "20190209T150017.020+0700",

        newDataItem.sys = { source: sender };                    // is based on the apikey from the sender and identifies the source of the data. this value is added to sys.source attribute

        newDataItem.time_event = moment.utc(eventTime).format(consts.dateTime.bigqueryZonelessTimestampFormat);
        newDataItem.time_zone = utils.datetimeZoneOffset(eventTime);
        newDataItem.time_processing = moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat);

        //  delete time_local as it has been replaced with the 3 standard time attributes above
        delete newDataItem.time_local;

        return newDataItem;

    }


}


module.exports = Monitoring;
