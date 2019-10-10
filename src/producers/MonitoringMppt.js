//@ts-check
"use strict";
/**
 * ./producers/MonitoringMppt.js
 *  Kafka mppt message producers for api devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');
const utils = require('../host/utils');
const configc = require('../host/configCommon');

const Producer = require('../producers');

const API_DATASET = enums.params.datasets.mppt;
const KAFKA_TOPIC = configc.env[configc.env.active].topics.monitoring.mppt;

/**
 */
class MonitoringMppt extends Producer {
    /**
    instance attributes:  

     constructor arguments  
    * @param {*} sender                                                         //  identifies the source of the data. this value is added to sys.source attribute in addMessage()
    */
    constructor() {

        // construct super
        super(API_DATASET, KAFKA_TOPIC);                        

    }

}



module.exports = MonitoringMppt;