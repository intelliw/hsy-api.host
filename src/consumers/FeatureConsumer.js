//@ts-check
'use strict';
/**
 * ./consumers/Mppt.js
 *  
 */

const enums = require('../environment/enums');
const consts = require('../host/constants');
const env = require('../environment/env');
const utils = require('../environment/utils');

const Feature = require('../producers/Feature');
const Consumer = require('./Consumer');

/**
 */
class FeatureConsumer extends Consumer {

    /**
    */
    constructor(senderId, apiPathIdentifier) {

        // construct consumer and its producer
        super(
            apiPathIdentifier,
            new Feature(senderId, apiPathIdentifier)
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

}


module.exports = FeatureConsumer;
