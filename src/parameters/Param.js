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
        let isValid = value ? true :false;                        // value must be provided 
        if (enumList) {                             // if an enum was provided the value must exist in it
            
            isValid = Object.values(enumList).indexOf(value) != MISSING;
            
        }
        this.value = value ? value : defaultValue;       // set default if value if missing or not valid 
        this.isValid = isValid;                          // flag if valid or not

    }
}


module.exports = Param;
