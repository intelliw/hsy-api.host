//@ts-check
'use strict';
/**
 * ./consumers/index.js
 * 
 * consumers 
 */
const enums = require('../environment/enums');

module.exports.Consumer = require('./Consumer');

module.exports.PmsConsumer = require('./PmsConsumer');
module.exports.MpptConsumer = require('./MpptConsumer');
module.exports.InverterConsumer = require('./InverterConsumer');

module.exports.FeatureConsumer = require('./FeatureConsumer');

/** static factory method to construct producers    
* @param {*} apiPathIdentifier                                               // apiPathIdentifier = enums.params.datasets..
* @param {*} senderId                                                        // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
*/
module.exports.getConsumer = (apiPathIdentifier, senderId) => {

    let consumer;
    switch (apiPathIdentifier) {

        // pms
        case enums.params.datasets.pms:
            consumer = new this.PmsConsumer(senderId);
            break;

        // mppt 
        case enums.params.datasets.mppt:
            consumer = new this.MpptConsumer(senderId);
            break;

        // inverter 
        case enums.params.datasets.inverter:
            consumer = new this.InverterConsumer(senderId);
            break;

        // logging feature - communicates logging configuration changes from host to consumer instances  
        case enums.paths.api.logging:
            consumer = new this.FeatureConsumer(senderId, enums.paths.api.logging);
            break;

        // feature toggles
        case enums.paths.api.features:
            consumer = new this.FeatureConsumer(senderId, enums.paths.api.features);
            break;

    }

    return consumer;
}
