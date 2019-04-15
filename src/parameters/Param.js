//@ts-check
"use strict";
/**
 * ./parameters/Param.js
 *  supertype for all parameters
 *  parameter class validates the value in the constructor and stores the parameter name and value
 */
const consts = require('../host/constants');
const utils = require('../host/utils');

class Param {
    /**
     * instance attributes:  
        "name": "period", 
        "value": "week",
        "isMandatory": true,
        "isValid": true,
       
     * constructor validates and stores parameter name and value. 
     * if the value is missing the default is used if provided. 
     * By default the param is mandatory 
     * isValid is true if the 
     * if the value was provided it will be validated against the enum 
     * the default value is used if the provided value is missing 
     */
    constructor(name, value, defaultValue, enumsList, isMandatory) {

        const ISMANDATORY_DEFAULT = true;
        
        // name & value                                   // use default if value not provided                                      
        this.name = name;
        this.value = value ? value : defaultValue;

        // validate enum                                  // if an enum was provided the value must exist in it  
        let enumTest = enumsList ? utils.valueExists(enumsList, this.value) : true;


        // isMandatory & isValid                          // isValid if 1) enumTest passes and 2) there must be a value if isMandatory
        this.isMandatory = (isMandatory != consts.NONE? isMandatory: ISMANDATORY_DEFAULT);
        this.isValid = enumTest && (this.isMandatory ? this.value : true);

    }
}

module.exports = Param;
