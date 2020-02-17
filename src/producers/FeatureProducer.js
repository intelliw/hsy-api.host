//@ts-check
"use strict";
/**
 * ./producers/Feature.js
 *  topic producer for feature toggles - to propogate configuration changes from host to consumer through message broker 
 */

const log = require('../logger').log;
const env = require('../environment/env');

const Producer = require('./Producer');

const WRITE_TOPIC = env.active.messagebroker.topics.system.feature;

class FeatureProducer extends Producer {
    /**
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                  // identifer based on the api path: this is typically from enums.params.datasets - e.g. pms; or 
     */
    constructor(apiPathIdentifier) {
        
        super(WRITE_TOPIC);
        this.apiPathIdentifier = apiPathIdentifier;

    }

    /** extracts an array of modified data items and sends these as messages to the broker 
    * @param {*} datasets                                                               // an array of datasets
    */
   transform(datasets, senderId) {
        
        let msgObj = { itemCount: 1, messages: [] };
        
        msgObj.messages.push(super._createMessage(this.apiPathIdentifier, datasets));   // add to the message array. the key is the feature name e.g. 'logging'

        return msgObj;

    }

}


module.exports = FeatureProducer;
