//@ts-check
"use strict";
/**
 * ./producers/Producer.js
 *  base type for all message producers 
 * this class deleagates to Kafka or PubSub depending on env.active.messagebroker
 */

const env = require('../environment');
const enums = require('../environment/enums');
const consts = require('../host/constants');
const utils = require('../environment/utils');

const log = require('../logger').log;

const moment = require('moment');

class Producer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                 // enums.params.datasets              - e.g. pms       
     * @param {*} writeTopic
     */
    constructor(apiPathIdentifier, writeTopic) {

        this.apiPathIdentifier = apiPathIdentifier;
        this.writeTopic = writeTopic;

    }

    /** implemented by subtype
    * @param {*} msgObj                                                             // e.g. msgObj = { itemCount: 0, messages: [] };
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(msgObj, sender) {
    }

    /** creates and returns a formatted message object 
    * this method is for subtypes to call while extracting data from a request body
    * the returned object contains stringified JSON 
    * e.g. returned message :
    *   { key: 'TEST-01',
    *     value: '{"pms":{"id":"TEST-01"},"data":[{"pack":{"id":"0241","dock":1,"amps":-1.601,"temp":[35,33,34],"cell":{"open":[],"volts":[3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.91]},"fet":{"open":[1,2],"temp":[34.1,32.2]},"status":"0001"},"sys":{"source":"STAGE001"},"time_event":"2019-09-09 08:00:06.0320","time_zone":"+07:00","time_processing":"2019-12-17 04:07:20.7790"}]}' 
    *     headers: ''  
    *   }
    * 
    * @param {*} key - is a string
    * @param {*} data - contains the message value 
    * @param {*} headers - a json object e.g. { 'corsrelation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67', system-id': 'my-system' }  
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
        let dataItemClone = utils.clone(dataItem);                // clone the object before any modifications, to prevent errors due to object re-referencing 

        // add standard attributes
        let eventTime = dataItemClone.time_local;                 // "data": [ { "time_local": "20190209T150017.020+0700",

        dataItemClone.sys = { source: sender };                    // is based on the apikey from the sender and identifies the source of the data. this value is added to sys.source attribute

        dataItemClone.time_event = moment.utc(eventTime).format(consts.dateTime.bigqueryZonelessTimestampFormat);
        dataItemClone.time_zone = utils.datetimeZoneOffset(eventTime);
        dataItemClone.time_processing = moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat);

        //  delete time_local as it has been replaced with the 3 standard time attributes above
        delete dataItemClone.time_local;

        return dataItemClone;

    }



    _isKafka() { return env.active.messagebroker.provider == enums.messageBroker.providers.kafka; }
    _isPubSub() { return env.active.messagebroker.provider == enums.messageBroker.providers.pubsub; }


}

module.exports = Producer;
