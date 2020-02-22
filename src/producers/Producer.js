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
const pub = require('../publishers').pub;

const moment = require('moment');

class Producer {
    /**
     * constructor arguments 
     * @param {*} writeTopic
     */
    constructor(writeTopic) {

        this.writeTopic = writeTopic;

    }

    /** sends messages to the broker  
    * @param {*} transformedMsgObj                                                              // e.g. msgObj = { itemCount: 0, messages: [] };
    * @param {*} senderId                                                                      // is based on the api key and identifies the source of the data. this value is added to 'sender' attribute 
    */
    async produce(transformedMsgObj, senderId) {

        // publish the transformed messages
        pub.publish(transformedMsgObj, this.writeTopic, senderId);

    }

    /**
     * creates an array of messagebroker messages and returns them in a results object
     * transform is implemented by subclass. 
     */
    transform(datasets) {
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
    _createMessage(key, data, headers) {

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

    /** add generic metadata attributes to each dataitem in the dataset
    *   note that this converts time_local to bigqueryZonelessTimestampFormat which does not have trailing offset hours 
    *       - but not required by bigquery as it will convert local time to utc if submitted with a zone offset
    * @param {*} senderId   senderId is the keyname of the apikey enum, sent in the POST request  and identifies the source of the data. this value is added to 'sender' attribute
    * @param {*} localEventTime  the local event time, this will be converted to UTC and used to populate time_event and time_zone
    */
    _addMetadata(dataObj, localEventTime, senderId) {

        // add standard attributes
        dataObj.sender = senderId;               // is based on the apikey from the sender and identifies the source of the data. this value is added to 'sender' attribute
        dataObj.time_event = moment.utc(localEventTime).format(consts.dateTime.bigqueryZonelessTimestampFormat);
        dataObj.time_zone = utils.datetimeZoneOffset(localEventTime);
        dataObj.time_processing = moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat);

        return dataObj;
    }


}

module.exports = Producer;
