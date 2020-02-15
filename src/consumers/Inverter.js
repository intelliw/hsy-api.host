//@ts-check
'use strict';
/**
 * ./consumers/Inverter.js
 *  
 */
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));

const enums = require('../environment/enums');
const consts = require('../host/constants');
const env = require('../environment/env');
const utils = require('../environment/utils');

const MonitoringInverter = require('../producers/MonitoringInverter');
const Consumer = require('./Consumer');

// instance parameters
const API_PATH_IDENTIFIER = env.active.messagebroker.topics.monitoring.inverter;

/**
 */
class Mppt extends Consumer {

    /**
    */
    constructor(senderId) {

        // construct consumer and its producer
        super(
            API_PATH_IDENTIFIER,
            new MonitoringInverter(senderId)
        );

    }


    /* transforms and produces the retrieved messages
    */
    consume(retrievedMsgObj) {

        let transformedMsgObj = this.producer.transform(retrievedMsgObj);
        this.producer.produce(transformedMsgObj);                                           // async produce() ok as by now we have connected to kafka/pubsub, and the dataset should have been validated and the only outcome is a 200 response

    }

    /* converts the retrieved messages from csv to application /json
    */
    normalise(retrievedMsgObj, fromMimeType) {

        let normalisedMsgObj = retrievedMsgObj

        return normalisedMsgObj;
    }

    // inverter schema (see https://docs.sundaya.monitored.equipment/docs/api.sundaya.monitored.equipment/0/c/Examples/POST/inverter%20POST%20example)
    _getSchema() {

        const schema = Joi.array().items(Joi.object({                               // [
            inverter: Joi.object({                                                  // { "inverter": { "id": "SPI-B2-01-001" }, 
                id: Joi.string()                                                    //    
            }),
            data: Joi.array().items(Joi.object({                                    //    "data": [
                time_local: Joi.date().utc().format(this._validTimestampFormats()),           // "time_local": "20190209T150006.032+0700", 
                pv: Joi.object({                                                        // "pv": { "volts": [48.000, 48.000], "amps": [6.0, 6.0] },      
                    volts: Joi.array().items(Joi.number().positive()).min(1).max(4),    //      float (array), array size 1-4, + only
                    amps: Joi.array().items(Joi.number().positive()).min(1).max(4)      //      float (array), array size 1-4, + only 
                }),
                battery: Joi.object({                                                   // "battery": { "volts" : 55.1, "amps": 0.0 },
                    volts: Joi.number().positive(),                                     //      float, + only
                    amps: Joi.number()                                                  //      float, +/-
                }),
                load: Joi.object({                                                      // "load": { "volts": [48.000, 48.000], "amps": [1.2, 1.2] },
                    volts: Joi.array().items(Joi.number().positive()).min(1).max(2),    //      float (array), array size 1-2, + only
                    amps: Joi.array().items(Joi.number().positive()).min(1).max(2)      //      float (array), array size 1-2, + only 
                }),
                grid: Joi.object({                                                      // "load": { "volts": [48.000, 48.000], "amps": [1.2, 1.2] },
                    volts: Joi.array().items(Joi.number().positive()).min(1).max(3),    //      float (array), array size 1-3, + only
                    amps: Joi.array().items(Joi.number()).min(1).max(3),                //      float (array), array size 1-3, +/-
                    pf: Joi.array().items(Joi.number().positive().max(1)).min(1).max(3),      //      float, max 1.0, (array), array size 1-3, + only
                }),
                status: Joi.string()                                                    // "status": "0801"
                    .hex().length(4)                                                    //      4-character, hex-encoded                    
            }))
        }));

        return schema;
    }

}


module.exports = Mppt;
