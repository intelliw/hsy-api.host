//@ts-check
"use strict";
/**
 * ./parameters/Datasets.js
 */

const Param = require('./Param');

const THIS_PARAM_NAME = 'datasets';

class Datasets extends Param {
    /**
     * instance attributes:  
        "name": the dataset name from the path apramter (e.g. 'pms' 
        "datasets": the body paramter e.g. [ { mppt: { id: 'IT6415AD-01-001' }, data: [ [Object] ] } ]
        "validationError" contains the output of consumer.validate(). if this is not empty isValid is set to false 
     *  constructor validates all datasets and the dataitems in them
     */
    constructor(datasetName, datasets, validationError = '') {
        // constuct the param 
        super(THIS_PARAM_NAME, datasets);

        this.datasetName = datasetName;

        // set validation errors  
        if (validationError != '') {
            this.isValid = false;
            this.validationError = validationError; 
        }
    }

}

module.exports = Datasets;

