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

const FeatureProducer = require('../producers/FeatureProducer');
const Consumer = require('./Consumer');

/**
 */
class FeatureConsumer extends Consumer {

    /**
    */
    constructor(apiPathIdentifier) {

        // construct consumer and its producer
        super(
            apiPathIdentifier,
            new FeatureProducer(apiPathIdentifier)
        );

    }


    /* transforms and produces the retrieved messages
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

}


module.exports = FeatureConsumer;
