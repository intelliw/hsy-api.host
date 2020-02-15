//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for message consumers  
 */
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));

const env = require('../environment/env');
const enums = require('../environment/enums');

const consts = require('../host/constants');

const VALID_TIMESTAMP_FORMATS = ['YYYYMMDDTHHmmss.SSSS+HHmm',                       //      "time_local": "20190209T150006.032+0700",
    'YYYYMMDDTHHmmss.SSSSZ', 'YYYYMMDDTHHmmss.SSSS'];

class Consumer {
    /**
    * @param {*} apiPathIdentifier
    * @param {*} producerObj
    * @param {*} senderId     *
    */
    constructor(apiPathIdentifier, producerObj, senderId) {

        this.apiPathIdentifier = apiPathIdentifier;
        this.producer = producerObj;                        // store reference to producer
        this.senderId = senderId;
    }

    /* validates the retrieved messages and returns validationError details if ther was an error 
    */
    validate(retrievedMsgObj) {
        
        let validationError = '';

        // validate the datasets
        if (this._isValidation()) {                                         // only if validation 'feature' is on (usually off in production)                              

            let schema = this._getSchema();                                 // get the validation schema for this dataset    
        
            // { error, value } = schema.validate(dataItem);
            let result = schema.validate(retrievedMsgObj);                  // e.g. "retrievedMsgObj is from the body paramter e.g. [ { mppt: { id: 'IT6415AD-01-001' }, data: [ [Object] ] } ]

            // error 
            if (result.error) {
                let errDetails = result.error.details[0];

                validationError = `${errDetails.message} | ${errDetails.context.value}`;

            // valid 
            // } else {                                                       // keep 'this.value' - as joi-date converting time_local to utc and losing the timezone offset 
                //dataset param .value = result.value;                        // result.value contains a validated clone of the datasets 
            }            
        
        }
        
        return validationError;

    }

    /* transforms and produces the retrieved messages
    */
    consume(retrievedMsgObj) {
    }


    /* analyses and retrieved messages for events
    */
    analyse(retrievedMsgObj) {
    }

    /* converts the retrieved messages from the specified mime type, to the standard mime type (usually application /json)
    */
    normalise(retrievedMsgObj, fromMimeType) {
    }

    // returns timestamp formats used by the validate() method
    _validTimestampFormats() {
        return VALID_TIMESTAMP_FORMATS; 
    }
    
    // returns whether the validation feature is switched on
    _isValidation() { return env.active.features.operational.includes(enums.features.operational.validation); }

}


module.exports = Consumer;