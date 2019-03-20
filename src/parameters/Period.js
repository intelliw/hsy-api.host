//@ts-check
"use strict";
/**
 * ./parameters/Energy.js
 *  
 */
const moment = require('moment');

const enums = require('../definitions/enums');
const consts = require('../definitions/constants');
const utils = require('../definitions/utils');

const Param = require('./Param');

/**
 * expects a date-time value in utc format. period is required (as a string) and must contain a complete date
 * checks to see if value is a valid time and sets default to current time if it is not.
 * the value is formatted according to the specified period (def.enum.period) argument 
 */

class Period extends Param {

    constructor(period, epoch) {
        
        const PARAM_NAME = 'period';

        // period ------------
        period = enums.period[period] ? period : enums.period.default;  // check if period is valid,  set default if it is not
        super(PARAM_NAME, period);                                      // no need for enums or defaults

        // epoch -------------
        const format = periodFormatString(period);           // date format for the period 
        let valid = isValidEpoch(epoch, format);                     // make sure epoch is a valid date-time 
        epoch = valid ? epoch : moment.utc().format(format);    // if not valid default to 'now'
        epoch = periodStart(period, epoch, format);             // adjust the start of the period for timeofday, week, quarter, fiveyear  
        //
        this.epoch = epoch;

        // period end------------
        this.end = periodEnd(period, epoch, format);
        
        this.id = 'week';                   
        this.prompt = 'Week';
        this.title = "04/02/2019 - 10/02/2019";
        //getCollection = [] new Param.Period(period.child, epoch + n, format)  ..iterated 

    }
}

// returns an epoch adjusted for the start of the period: if period is  hour, timeofday, week, month, quarter, year, fiveyear  
function periodStart(period, epoch, format) {

    switch (period) {

        // epoch format YYYYMMDDTHHmm ------------------------------------              
        case enums.period.hour:                         // adjust the minutes to zero
            epoch = moment.utc(epoch).set('minute', 0).format(format);    // minute is zero for hour
            break;

        case enums.period.timeofday:                    // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   

            let hr = consts.timeOfDayStart[timeOfDayStart(epoch)];        // get the starting hour for the timeofday     
            epoch = moment.utc(epoch).set('hour', hr).format(format);     // set hour to 0,6,12,or 18
            epoch = moment.utc(epoch).set('minute', 0).format(format);    // set minute always zero
            break;

        // epoch format YYYYMMDD -----------------------------------------
        case enums.period.week:                         // adjust to start of the week

            epoch = moment.utc(epoch).startOf('isoWeek').format(format);    // adjust to monday (iso week starts on monday)
            break;

        case enums.period.month:                        // adjust day to start of month

            epoch = moment.utc(epoch).startOf('month').format(format);    // set to first day of month
            break;

        case enums.period.quarter:                      // adjust month and day to start of last quarter (Jan, Apr, Jul, Oct)
            epoch = moment.utc(epoch).startOf('quarter').format(format);  // set to beginning of current quarter
            break;

        case enums.period.year:                         // adjust month and day to start of year 
            epoch = moment.utc(epoch).startOf('year').format(format);    // set to January 1st of this year
            break;

        case enums.period.fiveyear:                     // adjust to start of last 5 year block (2010, 2015, 2020 etc.)
            let yr = moment.utc(epoch).get('year');     // get the year
            yr = yr - (yr % 5);                         // round down to nearest 5 year epoch
            epoch = moment.utc(epoch).set('year', yr).format(format);     // set year
            epoch = moment.utc(epoch).startOf('year').format(format);    // set to January 1st of that year
            break;
    }

    return epoch;

}

// returns the end of the period: if period is  hour, timeofday, week, month, quarter, year, fiveyear  
function periodEnd(period, epoch, format) {

    let periodEnd;
    switch (period) {

        // epoch format YYYYMMDDTHHmmss.SSS, YYYYMMDDTHHmmss -----------------------------------              
        case enums.period.instant:                     // no adjustment - return milliseconds epoch (format YYYYMMDDTHHmmss.SSS)
        case enums.period.second:                      // no adjustment - return seconds epoch (format YYYYMMDDTHHmmss)
            periodEnd = epoch;
            break;

        // epoch format YYYYMMDDTHHmm ------------------------------------              
        case enums.period.hour:
            periodEnd = moment.utc(epoch).endOf('hour').format(format);
            break;

        case enums.period.timeofday:                    // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   
            const TIMEOFDAY_DURATION_HRS = 6;               // hours
            periodEnd = moment.utc(epoch).add(TIMEOFDAY_DURATION_HRS, 'hours').format(format);
            break;


        // epoch format YYYYMMDD -----------------------------------------
        case enums.period.week:                 
            periodEnd = moment.utc(epoch).endOf('isoWeek').format(format);  // has to be isoWeek
            break;

        case enums.period.day:
        case enums.period.month:                
        case enums.period.quarter:
        case enums.period.year:                 
            periodEnd = moment.utc(epoch).endOf(period).format(format);    // get the end of the period 
            break;

        case enums.period.fiveyear:                     // add 5 years to epoch
            const FIVEYEAR_DURATION_YRS = 5;        // years
            periodEnd = moment.utc(epoch).add(FIVEYEAR_DURATION_YRS, 'years').format(format);            
            break;
    }

    return periodEnd;

}

// checks if the epoch is a valid date-time
function isValidEpoch(epoch, format) {

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

    return isValid
}

// returns the starting hour for the timeofday period indicated by the epoch
function timeOfDayStart(epoch) {

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



// returns a format string for UTC time corresponding to the specified period.   
function periodFormatString(period) {

    let format;
    switch (period) {
        case enums.period.instant:
            format = 'YYYYMMDDTHHmmss.SSS';
            break;
        case enums.period.second:
            format = 'YYYYMMDDTHHmmss';
            break;
        case enums.period.hour:
        case enums.period.timeofday:            // timofday formatted same as hour
            format = 'YYYYMMDDTHHmm';
            break;
        case enums.period.day:
        case enums.period.week:                 // week and day are the same
        case enums.period.month:                // quarter formatted same as month
        case enums.period.quarter:
        case enums.period.year:                 // year and fiveyear are the same
        case enums.period.fiveyear:
        default:                                // default is week 
            format = 'YYYYMMDD';
            break;
    }

    return format;
};


module.exports = Period;
