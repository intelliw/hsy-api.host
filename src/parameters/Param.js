//@ts-check
"use strict";
/**
 * ./parameters/Param.js
 *  supertype for all objects in the parameters package
 * 
 */

// parameter class to validata and store paramters 
class Param {
    constructor(name, value, enumList, defaultValue) {

        this.name = name;

        // if an enum was provided the value must exist in it, otherwise set the value to default
        if (enumList) {
            value = enumList[value] ? value : defaultValue;
        } else {
            value = value ? value : defaultValue;       // set default if value is missing 
        }

        this.value = value;
    }
}
module.exports = Param;
