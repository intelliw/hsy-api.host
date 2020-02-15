//@ts-check
"use strict";
/**
 * ./parameters/Param.js
 *  supertype for all get parameters, headers, and datasets posted through a request path
 *  parameter class validates the value in the constructor and stores the parameter name and value
 */

const utils = require('../environment/utils');
const consts = require('../host/constants');

class Param {
    /**
     * instance attributes:  
        "name": "period", 
        "value": "week",
        "isOptional": true, whether the parameter is optional
        "isValid": true,
       
     * constructor validates and stores parameter name and value. 
     * if the value is missing the default is used if provided. 
     * By default the param is mandatory 
     * isValid is true if the param passes the enumtest and is present if it is mandatory
     * if the value was provided it will be validated against the enum 
     * the default value is used if the provided value is missing 
     * parameters are mandatory unless optional is true
     */
    constructor(name, value, defaultValue, enumsList, optional = false) {

        // name & value                                   // use default if value not provided                                      
        this.name = name;
        this.value = value ? value : defaultValue;

        // validate enum                                  // if an enum was provided the value must exist in it  
        let enumTest = enumsList ? utils.valueExistsInObject(enumsList, this.value) : true;

        // isOptional & isValid                          // isValid if 1) enumTest passes and 2) there must be a value unless isOptional
        this.isOptional = optional;

        // check if Param isValid 
        this.isValid = enumTest
            && (this.isOptional === true ? true : this.value != consts.NONE);       // there must be a value unless isOptional    

        // optional exception message set by validation functions, this is appended to the message below   
        this.validationError = '';

        // produce the message through a function - add the above validation error message, which will be updated by the subclass if there are errors
        this.message = () => { return this.isValid ? "" : `${(!this.isOptional && !this.value ? 'mandatory ' : 'invalid')} parameter: '${this.name}'. ${this.validationError}` };

    }
}

module.exports = Param;
