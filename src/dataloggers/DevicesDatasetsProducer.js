//@ts-check
"use strict";
/**
 * ./dataloggers/DevicesDatasetsProducer.js
 *  Kafka message producers for  api operation id devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const Producer = require('./Producer');

const KAFKA_ACK = enums.dataLogger.ack.leader;

/**
 * 
 */
class DevicesDatasetsProducer extends Producer {
    /**
    instance attributes:  
    * super.name: "accept", 
    * super.value: ?,
    * super.isValid: ?,

     constructor arguments  
    * @param {*} deviceDataset                          // post body from devices.datasets.post api operation
    */
    constructor(deviceDataset) {
        
        // construct super 
        let topic = selectTopic(deviceDataset.dataset);
        let clientId = enums.dataLogger.producers.devicesDatasets;  // e.g. 'devices.datasets'
        super(topic, clientId, KAFKA_ACK);

        // extract and add messages 
        let key = deviceDataset.device;                 // e.g.  BBC-PR1202-999
        // super.addMessage(key, 'hello'); 
        deviceDataset.data.forEach(dataItem => {
             super.addMessage(key, dataItem); 
        });
        
        // send the messages

    }

}

// selects the messaging topic based on the api dataset name
function selectTopic(datasetName) {

    let topic;
    switch (datasetName) {

        case enums.datasets.MPPTSNMP:

            topic = enums.dataLogger.topics.MPPTSNMP;
            break;

        case enums.datasets.PMSEPACK:
            topic = enums.dataLogger.topics.PMSEPACK;
            break;

    }
    return topic;
}



module.exports = DevicesDatasetsProducer;