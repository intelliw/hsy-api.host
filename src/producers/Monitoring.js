//@ts-check
"use strict";
/**
 * ./producers/Monitoring.js
 *  base type for Kafka message producers  
 */
const KafkaProducer = require('./KafkaProducer');

const consts = require('../host/constants');
const utils = require('../environment/utils');

const log = require('../host').log;

const moment = require('moment');

class Monitoring extends KafkaProducer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiPathDataset                                                               // enums.params.datasets
     * kafkaTopic                                                                   // env.active.topics.monitoring
     * constructor arguments 
     * @param {*} apiPathDataset                                                    // enums.params.datasets              - e.g. pms       
     */
    constructor(apiPathDataset, kafkaTopic) {

        super(apiPathDataset, kafkaTopic);

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
            log.exception(`${this.apiPathDataset} sendToTopic`, e.message, log.ERR.event());
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

            key = dataset[this.apiPathDataset].id;                                  // e.g. id from.. "pms": { "id": 

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
            results.messages.push(super.createMessage(key, dataset));                        // add to the message array

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


}


module.exports = Monitoring;
