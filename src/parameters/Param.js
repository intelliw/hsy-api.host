//@ts-check
"use strict";
/**
 * ./parameters/Param.js
 *  supertype for all parameters
 *  parameter class validates the value in the constructor and stores the parameter name and value
 * 
 */
const consts = require('../host/constants');
const utils = require('../host/utils');

class Param {
    /**
     * instance attributes:  
        "name": "period", 
        "value": "week",
        "isValid": true,
       
     * constructor validates and stores parameter name and value. 
     * if the value is missing the default is used and isValid is true.
     * if the value was provided it will be validated against the enum 
     * the default value is used if the provided value is missing 
     */
    constructor(name, value, defaultValue, enumsList) {

        // name
        this.name = name;

        // value
        this.value = value ? value : defaultValue;                                  // use default if value was not provided  

        // enum 
        let enumValid = enumsList ? utils.valueExists(enumsList, this.value) : true;  // if an enum was provided the value (or default if used) must exist in it
        
        // isValid 
        this.isValid = enumValid;                                                   // valid if validation passed 
        
    }
}


module.exports = Param;
