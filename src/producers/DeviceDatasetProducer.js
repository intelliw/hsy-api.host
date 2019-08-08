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
     "topic": dataset name
     "datasets":  object array of dataset items. 
        each dataset item has an id and an array of data objects each with an event timestampt
        e.g. 
        { "pms": { "id": "PMS-01-001" }, 
          "data": [
            { "time": "20190209T150006.032-0700",
                "pack": { "id": "0241", "dock": 1, "volts": "55.1", "amps": "-1.601", "temp": ["35.0", "33.0", "34.0"] },
                "cell": { "open": [1, 6],
                "volts": ["3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.91"] },
                "fet": { "open": [1, 2], "temp": ["34.1", "32.2", "33.5"] }
            },

     constructor arguments  
    * @param {*} deviceDataset                                       // post body from devices.datasets.post api operation
    */
    constructor(datasetName, datasetItems) {

        // call super
        let clientId = enums.messageBroker.producers.deviceDatasets;  // e.g. 'device.datasets'
        super(clientId, datasetName, enums.messageBroker.ack.leader);       // only waits for the leader to acknowledge 

        // store the data 
        this.datasets = datasetItems;

    }

    // each dataset object has an object property named after the dataset e.g. "pms": { "id": "PMS-01-001" }    
    extractData() {
        let key;

        let status = false;

        let datasetName = this.topic;                                    // e.g. pms - 

        // extract and add messages to super 
        this.datasets.forEach(dataset => {
            key = dataset[datasetName].id;                              // e.g. "pms": { "id": "PMS-01-001" }, "data": [ .. ]
            
            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                          // e.g. "data": [
               super.addMessage(key, dataItem);                             // adds processingTime to each dataitem 
            });
        });

        status = true;

        return status;
    }

}

module.exports = DeviceDatasetProducer;