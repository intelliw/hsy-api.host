//@ts-check
"use strict";
/**
 * ./producers/Monitoring.js
 *  base type for Kafka message producers  
 */
const ActiveMsgProducer = require('../producers').ActiveMsgProducer;

const consts = require('../host/constants');
const utils = require('../environment/utils');
const log = require('../logger').log;

const moment = require('moment');

class Monitoring extends ActiveMsgProducer {
    /**
     * instance attributes:  
     * apiPathIdentifier                                                            // enums.params.datasets
     * writeTopic                                                                   // env.active.messagebroker.topics.monitoring
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                 // enums.params.datasets              - e.g. pms       
     */
    constructor(apiPathIdentifier, writeTopic) {

        super(apiPathIdentifier, writeTopic);

    }


    /**
     * creates an array of messagebroker messages and returns them in a results object
     *  datasets - object array of dataset items. 
     *      the *array* (of datasets) in the req.body e.g. the [.. ] array in {"datasets": [.. ] ..}
     *  each dataset item has an id and an array of data objects
     *  each data object has a time_local event timestamp
     *  dataset objects have a common structure
     *  the id property must be in an object named after the dataset 
     *      e.g. { "pms": { "id": "PMS-01-001" },  "data": [ { "time_local": "20190209T150006.032+0700", ..]
     * the returned results object contains these properties
     *  itemCount  - a count of the total number of dataitems in all datasets / message
     *  messages[] - array of kafka messages, includes key,. value, header attributes (header is optional)
     *              each message.value contains a dataset with modified data items
     *  returned results object, e.g. :
     *  { itemCount: 1,
     *    messages: [ 
     *    { key: 'TEST-01',
     *      value: '{"pms":{"id":"TEST-01"},"data":[{"pack":{"id":"0241","dock":1,"amps":-1.601,"temp":[35,33,34],"cell":{"open":[],"volts":[3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.91]},"fet":{"open":[1,2],"temp":[34.1,32.2]},"status":"0001"},"sys":{"source":"STAGE001"},"time_event":"2019-09-09 08:00:06.0320","time_zone":"+07:00","time_processing":"2019-12-17 04:07:20.7790"}]}' 
     *      } ]
     *   }
     */
    _extractData(datasets, sender) {

        let key
        let dataItems = [];
        let dataItemCount = 0;
        let results = { itemCount: 0, messages: [] };

        let datasetsClone = utils.deepClone(datasets);                                  // clone the byref object before any modifications 

        // extract and add messages to results 
        datasetsClone.forEach(dataset => {                                          // e.g. "pms": { "id": "PMS-01-001" }, "data": [ { time_local: '20190809T150006.032+0700', pack: [Object] }, ... ]

            key = dataset[this.apiPathIdentifier].id;                               // e.g. dataset.pms.id - from.. "pms": { "id": 

            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                                      // e.g. "data": [ { "time_local": "2

                // add elements into the dataset
                let dataItemClone = super.addGenericAttributes(dataItem, sender);    // clone the dataItem and add common attributes (time_event, time_zone, time_processing)

                // add the message to the items buffer
                dataItems.push(dataItemClone);

            });

            // replace data array with newly created dataItems array
            dataItemCount += dataItems.length;
            dataset.data = dataItems;
            dataItems = [];

            // add the modified dataset to the message buffer
            results.messages.push(super.createMessage(key, dataset));               // add to the message array

        });

        results.itemCount = dataItemCount;
        return results;

    }


}

module.exports = Monitoring;
