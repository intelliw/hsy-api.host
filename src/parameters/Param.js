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

        // value            // use default if value was not provided  
        this.value = value ? value : defaultValue;                                  

        // enum             // if an enum was provided the value (or default if used) must exist in it
        let enumValid = enumsList ? utils.valueExists(enumsList, this.value) : true;  
        
        // isValid          // valid if enumValid passed and there must be a value 
        this.isValid = enumValid && this.value;                                                   
        
    }
}


module.exports = Param;
