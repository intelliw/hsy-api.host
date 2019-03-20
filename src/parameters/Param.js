//@ts-check
"use strict";
/**
 * ./parameters/Param.js
 *  supertype for all objects in the parameters package
 * 
 */

const moment = require('moment');

const enums = require('../definitions/enums');
const consts = require('../definitions/constants');
const utils = require('../definitions/utils');

// parameter class stores a parameter and optionally validates against an enum
class Param {
    constructor(name, value, defaultValue, enumList) {

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
 * expects a date-time value in utc format. period is required (as a string) and must contain a complete date
 * checks to see if value is a valid time and sets default to current time if it is not.
 * the value is formatted according to the specified period (def.enum.period) argument 
 */
class ParamTime extends Param {

    constructor(name, epoch, period) {

        const format = utils.periodFormatUTC(period);       // use date format for the period 

        // makle sure epoch is a valid date-time 
        let valid = isEpochValid(epoch, format);
        epoch = valid ? epoch : moment.utc().format(format);    // if not valid default to 'now'

        console.log('@4: ' + epoch);

        // adjust the start of the period for timeofday, week, quarter, fiveyear  
        epoch = adjustEpoch(period, epoch, format);

        console.log('@5: ' + epoch);

        // call super    
        super(name, epoch);                                 // no need for enuma or defaults

    }

}

// adjust the start of the period for hour, timeofday, week, month, quarter, year, fiveyear  
function adjustEpoch(period, epoch, format) {

    switch (period) {

        // epoch format YYYYMMDDTHHmm ------------------------------------              
        case enums.period.hour:                         // adjust the minutes to zero
            epoch = moment.utc(epoch).set('minute', 0).format(format);    // minute is zero for hour
            break;

        case enums.period.timeofday:                    // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   

            // get the starting hour for the timeofday   
            let hr = consts.timeOfDayStart[timeOfDay(epoch)];

            // adjust hour and minute     
            epoch = moment.utc(epoch).set('hour', hr).format(format);     // hour 
            epoch = moment.utc(epoch).set('minute', 0).format(format);    // minute always zero
            break;

        // epoch format YYYYMMDD -----------------------------------------
        case enums.period.week:                         // adjust to start of the week

            // adjust to monday (iso week starts on monday)
            epoch = moment.utc(epoch).startOf('isoWeek').format(format);
            break;

        case enums.period.month:                        // adjust day to start of month
            break;
        case enums.period.quarter:                      // adjust month and day to start of last quarter (Jan, Apr, Jul, Oct)
            break;
        case enums.period.year:                         // adjust month and day to start of year 
            break;
        case enums.period.fiveyear:                     // adjust to start of last 5 year block (2010, 2015, 2020 etc.)
            break;
    }

    console.log('@4.2 ' + epoch);

    return epoch;

}

// checks if the epoch is a valid date-time
function isEpochValid(epoch, format) {

    console.log('@1: ' + epoch);

    const MIN_DATE_LENGTH = 8;              // epoch must be at least 8 characters (e.g 20181202)

    const HOURS_LENGTH = 2;           // hour must 2 characters (e.g 12)
    const MINUTES_LENGTH = 4;         // minutes must be 4 characters (e.g 1200)
    const SECONDS_LENGTH = 6;         // secondss must be 6 characters (e.g 120050)
    const MILLISECONDS_LENGTH = 10;   // millseconds must be 10 characters (e.g 120050.233)

    // check if date is valid. 
    let isValid = (moment.utc(epoch, format).isValid());
    isValid = isValid && (epoch.length >= MIN_DATE_LENGTH);      // enforce minimum length

    //check if time is valid 
    if (epoch.indexOf('T') >= 0) {                      // if there is a time component
        let start = epoch.indexOf('T') + 1;
        let timeSubstring = epoch.substring(start);
        isValid = isValid && (timeSubstring.length == HOURS_LENGTH
            || timeSubstring.length == MINUTES_LENGTH
            || timeSubstring.length == SECONDS_LENGTH
            || timeSubstring.length == MILLISECONDS_LENGTH);      // enforce minimum length
    }

    console.log('@3: ' + epoch);

    return isValid
}

// returns the time of day for the epoch 
function timeOfDay(epoch) {

    let tod;
    let hr = moment.utc(epoch).get('hour');     // get the hour

    if (hr >= 0 && hr < 6) {
        tod = enums.timeOfDay.night;

    } else if (hr >= 6 && hr < 12) {
        tod = enums.timeOfDay.morning;

    } else if (hr >= 12 && hr < 18) {
        tod = enums.timeOfDay.afternoon;

    } else {
        tod = enums.timeOfDay.evening;
    }
    return tod;
}

module.exports = Param;
module.exports.ParamTime = ParamTime;