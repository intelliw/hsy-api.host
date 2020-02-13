//@ts-check
"use strict";
/**
 * ./producers/Feature.js
 *  topic producer for feature toggles - to propogate configuration changes from host to consumer through message broker 
 */

const log = require('../logger').log;
const Producer = require('./Producer');

class Feature extends Producer {
    /**
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                  // identifer based on the api path: this is typically from enums.params.datasets - e.g. pms; or 
     */
    constructor(apiPathIdentifier, writeTopic) {
        
        super(writeTopic);
        this.apiPathIdentifier = apiPathIdentifier;

    }

    /** extracts an array of modified data items and sends these as messages to the broker 
    * @param {*} datasets                                                           // an array of datasets
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
   transform(datasets, sender) {
        
        let msgObj = { itemCount: 1, messages: [] };
        
        msgObj.messages.push(super._createMessage(this.apiPathIdentifier, datasets));   // add to the message array. the key is the feature name e.g. 'logging'

        return msgObj;

    }

}


module.exports = Feature;
