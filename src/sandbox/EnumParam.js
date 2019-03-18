//@ts-check
"use strict";
/**
 * ./parameters/EnumParam.js
 *  supertype for all objects in the parameters package
 * 
 */

const Param = require('./Param');

// checks enum to see if value is valid and sets default if it is not  
class EnumParam extends Param{

    constructor(name, value, enumList, defaultValue) {

        value = enumList[value] ? value : defaultValue ;
        super(name, value, defaultValue);         // use super to store instance variables
    }
}


module.exports = EnumParam;;
