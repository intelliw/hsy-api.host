//@ts-check
"use strict";
/**
 * ./parameters/Datasets.js
 *  supertype to validate datasets in POST body
 */
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));

const utils = require('../environment/utils');
const env = require('../environment/env');
const enums = require('../environment/enums');
const consts = require('../host/constants');

const Param = require('./Param');

const THIS_PARAM_NAME = 'datasets';

const VALID_TIMESTAMP_FORMATS = ['YYYYMMDDTHHmmss.SSSS+HHmm',           //      "time_local": "20190209T150006.032+0700",
    'YYYYMMDDTHHmmss.SSSSZ', 'YYYYMMDDTHHmmss.SSSS'];

class Datasets extends Param {
    /**
     * instance attributes:  
        "name": the dataset name from the path apramter (e.g. 'pms' 
        "datasets": the body paramter e.g. [ { mppt: { id: 'IT6415AD-01-001' }, data: [ [Object] ] } ]
     * constructor validates all datasets and the dataitems in them
     */
    constructor(datasetName, datasets) {


        // constuct the param 
        super(THIS_PARAM_NAME, datasets);
        this.datasetName = datasetName;

        // validate the datasets
        if (this._isValidation()) {                                     // only if validation 'feature' is on (usually off in production)                              
            this._validate();
        }

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
    _validate() {

        // validate each dataset
        if (this.isValid) {

            let datasetsArray = this.value;
            let datasetName = this.datasetName;                                     // this.name is dataset name - set by constructor        

            let schema = this._getSchema(datasetName);                              // select a validation schema based on the dataset name    
            
            // { error, value } = schema.validate(dataItem);
            let result = schema.validate(datasetsArray);                            // e.g. "datasetsArray is from the body paramter e.g. [ { mppt: { id: 'IT6415AD-01-001' }, data: [ [Object] ] } ]
            
            // error 
            if (result.error) {
                let errDetails = result.error.details[0];

                this.isValid = false;                                               // this prevents further validation  
                this.validationError = `${errDetails.message} | ${errDetails.context.value}`;

            // valid 
            // } else {                                                              // keep 'this.value' - as joi-date converting time_local to utc and losing the timezone offset 
                //this.value = result.value;                                         // result.value contains a validated clone of the datasets 
            }
        }

        return this;
    }

    // pms schema (see https://docs.sundaya.monitored.equipment/docs/api.sundaya.monitored.equipment/0/c/Examples/POST/pms%20POST%20example)
    _getSchemaPms() {

        const schema = Joi.array().items(Joi.object({                           // [
            pms: Joi.object({                                                   //  { "pms": { "id": "PMS-01-001", "temp": 48.3 }, 
                id: Joi.string(),                                               //    
                temp: Joi.number().positive()                                   //      float	+ only 
            }),
            data: Joi.array().items(Joi.object({                                //      "data": [
                time_local: Joi.date().utc().format(VALID_TIMESTAMP_FORMATS),   //          "time_local": "20190209T150006.032+0700", 
                pack: Joi.object({                                              //          "pack": { "id": "0241", "dock": 1, "amps": -1.601, "temp": [35.0, 33.0, 34.0],
                    id: Joi.string(),                                                       //      string
                    dock: Joi.number().integer().positive().min(1).max(48),                 //      integer, + only,  1-48
                    amps: Joi.number(),                                                     //      float, +/-
                    temp: Joi.array().items(Joi.number().positive()).min(3).max(3),         //      float (array)	array size 3, + only
                    cell: Joi.object({                                                      // "cell": { "open": [], "volts": [3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.91] },
                        volts: Joi.array().items(Joi.number().positive()).min(14).max(14),  //      float (array)	array size 14, + only
                        open: Joi.array().unique().items(Joi.number().integer().positive().max(14)).max(14)     // integer (array)	1-14, uniqueitems, array size 0-14
                    }),
                    fet: Joi.object({                                                       // "load": { "volts": [48.000, 48.000], "amps": [1.2, 1.2] },
                        temp: Joi.array().items(Joi.number().positive()).min(2).max(2),     //      float	array size 2, + only
                        open: Joi.array().unique().items(Joi.number().integer().positive().max(2)).max(2)     // integer (array)	1-2, uniqueitems, array size 2
                    }),
                    status: Joi.string()                                                    // "status": "0801"
                        .hex().length(4)                                                    //      4-character, hex-encoded                    
                }),
            }))
        }));

        return schema;

    }

    // mppt schema (see https://docs.sundaya.monitored.equipment/docs/api.sundaya.monitored.equipment/0/c/Examples/POST/mppt%20POST%20example)
    _getSchemaMppt() {

        const schema = Joi.array().items(Joi.object({                               // [
            mppt: Joi.object({                                                  //  { "mppt": { "id": "IT6415AD-01-001" }, 
                id: Joi.string()                                                //    
            }),
            data: Joi.array().items(Joi.object({                                //    "data": [
                time_local: Joi.date().utc().format(VALID_TIMESTAMP_FORMATS),           // "time_local": "20190209T150006.032+0700", 
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

    // inverter schema (see https://docs.sundaya.monitored.equipment/docs/api.sundaya.monitored.equipment/0/c/Examples/POST/inverter%20POST%20example)
    _getSchemaInverter() {

        const schema = Joi.array().items(Joi.object({                               // [
            inverter: Joi.object({                                                  // { "inverter": { "id": "SPI-B2-01-001" }, 
                id: Joi.string()                                                    //    
            }),
            data: Joi.array().items(Joi.object({                                    //    "data": [
                time_local: Joi.date().utc().format(VALID_TIMESTAMP_FORMATS),           // "time_local": "20190209T150006.032+0700", 
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
                grid: Joi.object({                                                      // "load": { "volts": [48.000, 48.000], "amps": [1.2, 1.2] },
                    volts: Joi.array().items(Joi.number().positive()).min(1).max(3),    //      float (array), array size 1-3, + only
                    amps: Joi.array().items(Joi.number()).min(1).max(3),                //      float (array), array size 1-3, +/-
                    pf: Joi.array().items(Joi.number().positive().max(1)).min(1).max(3),      //      float, max 1.0, (array), array size 1-3, + only
                }),
                status: Joi.string()                                                    // "status": "0801"
                    .hex().length(4)                                                    //      4-character, hex-encoded                    
            }))
        }));

        return schema;
    }

    // selects the validation schema for the dataset  
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

