//@ts-check
"use strict";
/**
 * ./producers/MonitoringPms.js
 *  Kafka pms message producer for api devices.datasets.post  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');
const utils = require('../host/utils');

const configc = require('../host/configCommon');

const KafkaProducer = require('../producers/KafkaProducer');

const API_DATASET = enums.params.datasets.pms;
const KAFKA_TOPIC = configc.env[configc.env.active].topics.monitoring.pms;

/**
 */
class MonitoringPms extends KafkaProducer {
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


module.exports = MonitoringPms;