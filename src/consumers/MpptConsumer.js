//@ts-check
'use strict';
/**
 * ./consumers/Mppt.js
 *  
 */
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));

const enums = require('../environment/enums');
const consts = require('../host/constants');
const env = require('../environment/env');
const utils = require('../environment/utils');

const MpptProducer = require('../producers/MpptProducer');
const Consumer = require('./Consumer');

// instance parameters
const API_PATH_IDENTIFIER = env.active.messagebroker.topics.monitoring.mppt;

/**
 */
class MpptConsumer extends Consumer {

    /**
    */
    constructor() {

        // construct consumer and its producer
        super(
            API_PATH_IDENTIFIER,
            new MpptProducer()
        );

    }


    /** transforms the retrieved messages and calls producer to piublish the transformed messages
     * @param {*} senderId                                                                      // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    consume(retrievedMsgObj, senderId) {

        let transformedMsgObj = this.producer.transform(retrievedMsgObj, senderId);
        this.producer.produce(transformedMsgObj, senderId);                                           // async produce() ok as by now we have connected to kafka/pubsub, and the dataset should have been validated and the only outcome is a 200 response

    }

    /* converts the retrieved messages from csv to application /json
    */
    convert(retrievedMsgObj, fromMimeType) {

        let convertedMsgObj = retrievedMsgObj

        return convertedMsgObj;
    }

    // mppt schema (see https://docs.sundaya.monitored.equipment/docs/api.sundaya.monitored.equipment/0/c/Examples/POST/mppt%20POST%20example)
    _getSchema() {

        const schema = Joi.array().items(Joi.object({                               // [
            mppt: Joi.object({                                                  //  { "mppt": { "id": "IT6415AD-01-001" }, 
                id: Joi.string()                                                //    
            }),
            data: Joi.array().items(Joi.object({                                //    "data": [
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
                status: Joi.string()                                                    // "status": "0801"
                    .hex().length(4)                                                    //      4-character, hex-encoded                    
            }))
        }));

        return schema;
    }

}


module.exports = MpptConsumer;
