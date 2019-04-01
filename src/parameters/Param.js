//@ts-check
"use strict";
/**
 * ./parameters/Param.js
 *  supertype for all parameters
 *  parameter class validates the value in the constructor and stores the parameter name and value
 * 
 */
const consts = require('../system/constants');
class Param {
    /**
     * attributes:  
     * name: "period", 
     * value: "week",
     * isValid: true,
     * 
     * constructor validates and stores parameter name and value. 
     * if the value is missing the default is used and isValid is true.
     * if the value was provided it will be validated against the enum 
     * the default value is used if the provided value is missing or not valid
     */
    constructor(name, value, defaultValue, enumList) {

        const ENUM_MISSING = -1;
        const VALUE_PROVIDED = value ? true : false;                        // true if a value was provided 

        // name
        this.name = name;

        // value
        value = VALUE_PROVIDED ? value : defaultValue;                      // use default if value not provided  
        
        let enumValid = true;
        if (enumList) {                                                     // if an enum was provided the value (or default if used) must exist in it
            enumValid = Object.values(enumList).indexOf(value) == ENUM_MISSING ? false : true;     
        }
        this.value = enumValid ? value : defaultValue;                      // use default if enum not valid  

        // isValid 
        this.isValid = enumValid ;                                          // valid if validation passed 

    }
}


module.exports = Param;
