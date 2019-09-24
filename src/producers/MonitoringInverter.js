//@ts-check
"use strict";
/**
 * ./producers/MonitoringInverter.js
 *  Kafka inverter message producers for api devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');
const utils = require('../host/utils');

const Producer = require('../producers');

const API_DATASET = enums.params.datasets.inverter;
const KAFKA_TOPIC = enums.messageBroker.topics.monitoring.inverter;

/**
 */
class MonitoringInverter extends Producer {
    /**
    instance attributes:  

     constructor arguments  
    * @param {*} sender                                                         //  identifies the source of the data. this value is added to sys.source attribute in addMessage()
    */
    constructor() {

        // construct super
        super(API_DATASET, KAFKA_TOPIC);                                               // only waits for the leader to acknowledge 

    }

}



module.exports = MonitoringInverter;