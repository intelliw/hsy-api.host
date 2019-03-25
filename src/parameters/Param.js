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
        const MISSING = -1;

        // name
        this.name = name;
        
        // value
        if (enumList) {                             // if an enum was provided the value must exist in it
            value = Object.values(enumList).indexOf(value) == MISSING ? defaultValue :  value;
            //value = enumList[value] ? value : defaultValue;
        }
        value = value ? value : defaultValue;       // set default if value is missing 
        //    
        this.value = value;
    }
}


module.exports = Param;
