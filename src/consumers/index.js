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
*/
module.exports.getConsumer = (apiPathIdentifier) => {

    let consumer;
    switch (apiPathIdentifier) {

        // pms
        case enums.params.datasets.pms:
            consumer = new this.PmsConsumer();
            break;

        // mppt 
        case enums.params.datasets.mppt:
            consumer = new this.MpptConsumer();
            break;

        // inverter 
        case enums.params.datasets.inverter:
            consumer = new this.InverterConsumer();
            break;

        // logging feature - communicates logging configuration changes from host to consumer instances  
        case enums.paths.api.logging:
            consumer = new this.FeatureConsumer(enums.paths.api.logging);
            break;

        // feature toggles
        case enums.paths.api.features:
            consumer = new this.FeatureConsumer(enums.paths.api.features);
            break;

    }

    return consumer;
}
