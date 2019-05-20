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
        "isOptional": true,
        "isValid": true,
       
     * constructor validates and stores parameter name and value. 
     * if the value is missing the default is used if provided. 
     * By default the param is mandatory 
     * isValid is true if the param passes the enumtest and is present if it is mandatory
     * if the value was provided it will be validated against the enum 
     * the default value is used if the provided value is missing 
     */
    constructor(name, value, defaultValue, enumsList, optional) {

        const OPTIONAL_DEFAULT = false;                   // by default parameters are mandatory   
        
        // name & value                                   // use default if value not provided                                      
        this.name = name;
        this.value = value ? value : defaultValue;

        // validate enum                                  // if an enum was provided the value must exist in it  
        let enumTest = enumsList ? utils.valueExistsInObject(enumsList, this.value) : true;


        // isOptional & isValid                          // isValid if 1) enumTest passes and 2) there must be a value unless isOptional
        this.isOptional = (optional ? optional: OPTIONAL_DEFAULT);
        this.isValid = enumTest && (this.isOptional ? true : this.value);       // there must be a value unless isOptional    

    }
}

module.exports = Param;
