//@ts-check
"use strict";
/**
 * ./producers/DevicesDatasetsProducer.js
 *  Kafka message producers for  api operation id devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const Producer = require('../producers');

const KAFKA_ACK = enums.dataLogger.ack.leader;
const KAFKA_TOPIC = enums.dataLogger.topics.PMSEPACK;

/**
 * 
 */
class PmsEpackProducer extends Producer {
    /**
    instance attributes:  
    * dataset:

     constructor arguments  
    * @param {*} deviceDataset                                          // post body from devices.datasets.post api operation
    */
    constructor(deviceDataset) {

        // call super
        let clientId = enums.dataLogger.producers.devicesDatasets;      // e.g. 'devices.datasets'
        super(clientId, KAFKA_TOPIC, KAFKA_ACK);
        
        this.dataset = deviceDataset;
    }

    extractData() {

        let status = false;

        // extract and add messages to super 
        let key = this.dataset.device;                                 // e.g.  BBC-PR1202-999
        this.dataset.data.forEach(dataItem => {
            super.addMessage(key, dataItem);                           // adds processingTime to each dataitem 
        });
        status = true;

        return status;
    }

}


module.exports = PmsEpackProducer;