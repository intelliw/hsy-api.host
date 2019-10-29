//@ts-check
"use strict";
/**
 * ./parameters/Datasets.js
 *  supertype to validate datasets in POST body
 */

const utils = require('../environment/utils');
const env = require('../environment/env');
const enums = require('../environment/enums');
const consts = require('../host/constants');

const Param = require('./Param');

class Datasets extends Param {
    /**
     * instance attributes:  
        "name": the dataset name from the path apramter (e.g. 'pms' 
        "datasets": the body paramter e.g. { "datasets": [ { "mppt": { "id": "IT6415AD-01-001" }, "data": [ .. 
     * constructor validates all datasets and the dataitems in them
     */
    constructor(datasetName, datasets) {

        // constuct the param
        super(datasetName, datasets);                                       // name and value will get replaced with the faulty element name and value if validation fails    
        
        // start validations    
        if (this._isValidation()) {                                         // check if this feature is on (should be off in production, but can be switched on when troubleshooting)
            switch (datasetName) {

                // pms
                case enums.params.datasets.pms:
                    break;

                // mppt 
                case enums.params.datasets.mppt:
                    this._validate(datasetName, this._validateMppt);
                    break;

                // inverter 
                case enums.params.datasets.inverter:
                    break;

            }

        }

    }

    /* validates the datasets in this.value (created during construction)  
     * if there is a validation error, this function replaces:
     *  this.name           - with the JSON path of the invalid element (e.g. 'pv.volts'
     *  this.value          - with the invalid value in that dataset element
     *  this.optional       - with the optionality of that dataset element
     *  this.isValid        - false
     *  this.validationRule - a textual description of the rule which failed validation
     * note: this.message must not be set - as it produces a message based on the above set of properties
     * 
     * this allows the Validate.validateParams() method to produce a Request status and error message for this dataset param  
    */
    _validate(datasetName, validationFunction) {

        let key;
        let datasets = this.value;

        console.log('ok..............')
        console.log(datasets)
        // extract and add messages to results 
        datasets.forEach(dataset => {                                               // e.g. "pms": { "id": "PMS-01-001" }, "data": [ { time_local: '20190809T150006.032+0700', pack: [Object] }, ... ]

            if (this.isValid) {
                
                key = dataset[datasetName].id;                                          // e.g. id from.. "pms": { "id": 
                console.log(key);

                // add each data item in the dataset as an individual message
                dataset.data.forEach(dataItem => {                                      // e.g. "data": [ { "time_local": "2
                    if (this.isValid) {
                        console.log(dataItem.time_local);
                        validationFunction(this, dataItem);                                               // call the validation function 
                    }
                });

            }
        });

    }

    _validateMppt(param, dataItem) {
        console.log(`is array ? ${Array.isArray(dataItem.pv.volts)}`);
        /* 
        param.name = 'pv.volts';
        param.value = '48.000';
        param.optional = false;
        param.isValid = false;
        param.validationRule = 'This element must contain an array';
        */
    }


    // returns whether the validation feature is switched on
    _isValidation() { return env.active.features.operational.includes(enums.features.operational.validation); }
}

module.exports = Datasets;
