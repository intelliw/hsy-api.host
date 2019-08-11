//@ts-check
"use strict";
/**
 * ./producers/DevicesDatasetsProducer.js
 *  Kafka message producers for api devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const Producer = require('../producers');

/**
 * 
 */
class DeviceDatasetProducer extends Producer {
    /**
    instance attributes:  

     constructor arguments  
    * @param {*} deviceDataset                                              // post body from devices.datasets.post api operation
    */
    constructor() {

        // call super
        let clientId = enums.messageBroker.producers.deviceDatasets;        // e.g. 'device.datasets'
        super(clientId, enums.messageBroker.ack.leader);                    // only waits for the leader to acknowledge 

    }

    /**
     each dataset object has an object property named after the dataset e.g. "pms": { "id": "PMS-01-001" }    
    datasetName this is also the topic                                      // e.g. pms - 
    datasets    object array of dataset items. 
        each dataset item has an id and an array of data objects each with an event timestamp
    e.g. 
    { "pms": { "id": "PMS-01-001" }, 
      "data": [
        { "time": "20190209T150006.032-0700",
            "pack": { "id": "0241", "dock": 1, "volts": "55.1", "amps": "-1.601", "temp": ["35.0", "33.0", "34.0"] },
            "cell": { "open": [1, 6],
            "volts": ["3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.91"] },
            "fet": { "open": [1, 2], "temp": ["34.1", "32.2", "33.5"] }
        },
    */
    extractData(datasetName, datasets) {
        let key;
        let status = false;
        
        // extract and add messages to super 
        datasets.forEach(dataset => {

            key = dataset[datasetName].id;                              // e.g. id from.. "pms": { "id": "PMS-01-001" }, "data": [ .. ]
            
            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                          // e.g. "data": [
               dataItem = { id: key, ...dataItem };                     // prepend the id field to each dataitem
               super.addMessage(key, dataItem);                         // addMessage will append a processingTime to the dataitem 
            });
        });

        status = true;

        return status;
    }

}

module.exports = DeviceDatasetProducer;