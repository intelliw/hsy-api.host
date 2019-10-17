//@ts-check
"use strict";
/**
 * ./producers/MonitoringPms.js
 *  Kafka pms message producer for api devices.datasets.post  
 */
const consts = require('../configs/constants');
const enums = require('../host/enums');
const utils = require('../host/utils');

const env = require('../host/environments');

const KafkaProducer = require('../producers/KafkaProducer');

const API_DATASET = enums.params.datasets.pms;
const KAFKA_TOPIC = env.env[env.env.active].topics.monitoring.pms;

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