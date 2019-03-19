//@ts-check
"use strict";
/**
 * ./parameters/Param.js
 *  supertype for all objects in the parameters package
 * 
 */


// parameter class stores a parameter and optionally validates against an enum
class Param {
    constructor(name, value, enumList, defaultValue) {

        this.name = name;

        // if an enum was provided the value must exist in it
        if (enumList) {
            value = enumList[value] ? value : defaultValue;
        }

        // set the value to default
        value = value ? value : defaultValue;       // set default if value is missing 

        this.value = value;
    }
}

/**
 * expects a date-time value in utc format. period is required (as a string)
 * checks to see if value is a valid time and sets default to current time if it is not.
 * the value is formatted accordinf to the specified period (def.enum.period) argument 
 */
class ParamTime extends Param {

    constructor(name, value, period) {
        const moment = require('moment');
        const def = require('../definitions');

        // check iof the date is valid
        var isValid = (moment(value, def.constants.DATE_PARAM_FORMAT).isValid());     // must be in 

        // if  not a valid moment then default to now
        console.log(isValid);
        value = isValid ? value : moment.utc();

        // format value according to period        
        var format = def.utils.periodFormatUTC(period);
        value = moment.utc(value).format(format);           //  e.g. 20190310 for 'week' (YYYYMMDD)

        // call super    
        super(name, value);                                 // no need for enuma or defaults

    }
}


module.exports = Param;
module.exports.ParamTime = ParamTime;