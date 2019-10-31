//@ts-check
"use strict";
/**
 * ./parameters/Datasets.js
 *  supertype to validate datasets in POST body
 */
const Joi = require('@hapi/joi');

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

    }

    /* validates datasets in this.value (created during construction)  
     * if there is a validation error, this function replaces:
     *  this.isValid            - false
     *  this.value              - replaces the datasets with the invalid dataitem (i.e. datasets.data[x]
     *  this.validationError    - the error message produced by the validation 
     * note: this.message must not be set - as it produces a message based on the above set of properties
     * 
     * this allows the Validate.validateParams() method to produce a Request status and error message for this dataset param  
    */
    validate() {
        if (this._isValidation()) {                                         // check if the validation 'feature' is on (it should be off in production, but can be switched on when troubleshooting)
            
        let key;
            let datasets = this.value;
            let datasetName = this.name;                                    // this.name is dataset name - set by constructor        

            // select 1 of the validation functions based on the dataset name    
            let schema = this._getSchema(datasetName);

            // validate each dataset
            datasets.forEach(dataset => {                                     // e.g. "datasets": ["pms": { "id": "PMS-01-001" }, "data": [ { time_local: '20190809T150006.032+0700', pack: [Object] }, ... ]
                key = dataset[datasetName].id;                               // e.g. id from.. "pms": { "id": 

                if (this.isValid) {
                    // validate each data item in the dataset
                    dataset.data.forEach(dataItem => {                        // e.g. "data": [ { "time_local": "2

                        // call the validation function 
                        if (this.isValid) { 

                            // const { error, value } = schema.validate(dataItem);
                            let result = schema.validate(dataItem);
                            if (result.error) {
                                let errDetails = result.error.details[0];

                                this.isValid = false;                          // this prevents further validation  
                                this.value = dataItem;
                                this.validationError = `${key}: ${errDetails.message} (${errDetails.context.value})`;
                            }
                        }
                        
                    });
                }
            });

        }

        return this;
    }

    _getSchemaePms() {
        /* 
        param.name = 'pv.volts';
        param.value = '48.000';
        param.optional = false;
        param.isValid = false;
        param.validationError = 'This element must contain an array';
        */
    }

    _getSchemaMppt() {

       const schema = Joi.object({ 
            pv: Joi.object({                                          // "pv": { "volts": [48.000, 48.000], "amps": [6.0, 6.0] },      
                volts: Joi.array().items(Joi.number().positive()).max(4),        
                amps: Joi.array().items(Joi.number().positive()).max(4)
            })
        });                   
       

       return schema; 
    }

    _getSchemaInverter() {
        /* 
        param.name = 'pv.volts';
        param.value = '48.000';
        param.optional = false;
        param.isValid = false;
        param.validationError = 'This element must contain an array';
        */
    }
    
    // selects the validation function for the dataset  
    _getSchema(datasetName) {

        let schema;

        switch (datasetName) {
            case enums.params.datasets.pms:                             // pms
                schema = this._getSchemaPms();
                break;
            case enums.params.datasets.mppt:                            // mppt 
                schema = this._getSchemaMppt();
                break;
            case enums.params.datasets.inverter:                        // inverter 
                schema = this._getSchemaInverter();
                break;
        }
        return schema;
    }


    // returns whether the validation feature is switched on
    _isValidation() { return env.active.features.operational.includes(enums.features.operational.validation); }
}



module.exports = Datasets;

