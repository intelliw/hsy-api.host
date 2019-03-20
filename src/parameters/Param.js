//@ts-check
"use strict";
/**
 * ./parameters/Param.js
 *  supertype for all parameters
 * 
 */

// parameter class stores a parameter and optionally validates against an enum
class Param {
    constructor(name, value, defaultValue, enumList) {

        // name
        this.name = name;
        
        // value
        if (enumList) {                             // if an enum was provided the value must exist in it
            value = enumList[value] ? value : defaultValue;
        }
        value = value ? value : defaultValue;       // set default if value is missing 
        //    
        this.value = value;
    }
}


module.exports = Param;
