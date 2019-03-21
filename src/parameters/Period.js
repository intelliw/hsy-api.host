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
const INSTANT_FORMAT = periodFormatString(enums.period.instant, true);     // the default format, YYYYMMDDTHHmmss.SSS

/**
 * expects a date-time value in utc format. period is required (as a string) and must contain a complete date
 * checks to see if value is a valid time and sets default to current time if it is not.
 * the value is formatted according to the specified period (def.enum.period) argument 
 */

class Period extends Param {

    constructor(period, epoch) {

        const PARAM_NAME = 'period';
        const REL = 'self';
        const defaultFormat = INSTANT_FORMAT;                     // use ms precision for period epoch and end 

        // period ------------
        period = enums.period[period] ? period : enums.period.default;  // check if period is valid,  set default if it is not
        super(PARAM_NAME, period);                                      // no need for enums or defaults

        // epoch and end - validate and normalise the epoch for the supplied period 
        let valid = isEpochValid(epoch, defaultFormat);                // make sure epoch is a valid date-time 
        epoch = valid ? epoch : moment.utc().format(defaultFormat);    // if not valid default to 'now'
        epoch = periodStart(period, epoch, defaultFormat);             // adjust the start of the period for timeofday, week, quarter, fiveyear  
        //..
        this.epochInstant = epoch;
        this.endInstant = periodEnd(period, epoch, defaultFormat);     // period end - get the end date-time based on the epoch and period 

        // properties for display 
        this.epoch = periodFormat(this.epochInstant, period)           // formatted for the period  
        this.end = periodFormat(this.endInstant, period)
        //.. 
        this.rel = REL;                                                // btw: name = Param.value
        this.prompt = periodPrompt(period, this.epochInstant);
        this.title = titleString(this.epochInstant, this.endInstant, period)          // "04/02/2019 - 10/02/2019";

    }


    // returns the next period 
    getNext() {
        const REL = 'next';

        // add a milisecond to the period end to make it the next period epoch
        let nextEpoch = moment.utc(this.endInstant).add(1, 'milliseconds').format(INSTANT_FORMAT);
        
        //create the period and sets its relationship
        let nextPeriod = new Period(this.value, nextEpoch);
        nextPeriod.rel = REL

        return nextPeriod;

    }

}

// returns an epoch adjusted for the start of the period
function periodStart(period, epoch, format) {

    switch (period) {

        // epoch format YYYYMMDDTHHmmss.SSS -----------------------------------              
        case enums.period.instant:

            epoch = moment.utc(epoch).format(format);                     // no adjustment - return milliseconds epoch (format YYYYMMDDTHHmmss.SSS)  
            break;

        case enums.period.timeofday:                    // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   

            let hr = consts.timeOfDayStart[timeOfDay(epoch)];        // get the starting hour for the timeofday     
            epoch = moment.utc(epoch).set('hour', hr).format(format);     // set hour to 0,6,12,or 18
            epoch = moment.utc(epoch).set('minute', 0).format(format);    // set minute always zero
            break;

        // epoch format YYYYMMDD -----------------------------------------
        case enums.period.week:                         // adjust to start of the week

            epoch = moment.utc(epoch).startOf('isoWeek').format(format);    // adjust to monday (iso week starts on monday)
            break;

        case enums.period.fiveyear:                     // adjust to start of last 5 year block (2010, 2015, 2020 etc.)

            let yr = moment.utc(epoch).get('year');     // get the year
            yr = yr - (yr % 5);                         // round down to nearest 5 year epoch
            epoch = moment.utc(epoch).set('year', yr).format(format);     // set year
            epoch = moment.utc(epoch).startOf('year').format(format);    // set to January 1st of that year
            break;

        case enums.period.hour:
        case enums.period.minute:
        case enums.period.second:
        case enums.period.day:
        case enums.period.month:
        case enums.period.quarter:
        case enums.period.year:
            epoch = moment.utc(epoch).startOf(period).format(format);    // get the end of the period 
            break;

    }

    return epoch;

}

// returns the end of the period: if period is  hour, timeofday, week, month, quarter, year, fiveyear  
function periodEnd(period, epoch, format) {

    let periodEnd;
    switch (period) {

        case enums.period.instant:
            periodEnd = moment.utc(epoch).format(format);   // period epoch and end are the same for 'instant' 
            break;

        case enums.period.timeofday:                        // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   
            const TIMEOFDAY_DURATION_HRS = 6;               // hours
            periodEnd = moment.utc(epoch).add(TIMEOFDAY_DURATION_HRS, 'hours').endOf('hour').format(format);
            break;

        case enums.period.week:
            periodEnd = moment.utc(epoch).endOf('isoWeek').format(format);  // has to be isoWeek
            break;

        case enums.period.fiveyear:                         // add 5 years to epoch
            const FIVEYEAR_DURATION_YRS = 5;                // years
            periodEnd = moment.utc(epoch).add(FIVEYEAR_DURATION_YRS, 'years').endOf('year').format(format);
            break;

        case enums.period.hour:
        case enums.period.minute:
        case enums.period.second:
        case enums.period.day:
        case enums.period.month:
        case enums.period.quarter:
        case enums.period.year:
            periodEnd = moment.utc(epoch).endOf(period).format(format);    // get the end of the period 
            break;
    }

    return periodEnd;

}

// checks if the epoch is a valid date-time
function isEpochValid(epoch, format) {

    const MIN_DATE_LENGTH = 8;              // epoch must be at least 8 characters (e.g 20181202)

    const HOURS_LENGTH = 2;                 // hour must 2 characters (e.g 12)
    const MINUTES_LENGTH = 4;               // minutes must be 4 characters (e.g 1200)
    const SECONDS_LENGTH = 6;               // secondss must be 6 characters (e.g 120050)
    const MILLISECONDS_LENGTH = 10;         // millseconds must be 10 characters (e.g 120050.233)

    const ISO8601_TIME_DELIMITER = 'T';

    // check if date is valid. 
    let date = epoch;
    if (epoch.indexOf(ISO8601_TIME_DELIMITER) >= 0) {                           // if there is a time component
        date = epoch.substring(0, epoch.indexOf(ISO8601_TIME_DELIMITER) + 1);     // get the date part
    }

    let isValid = (moment.utc(date, format).isValid());
    isValid = isValid && (date.length >= MIN_DATE_LENGTH);                      // enforce minimum length

    //check if time is valid 
    if (epoch.indexOf(ISO8601_TIME_DELIMITER) >= 0) {                           // if there is a time component
        let time = epoch.substring(epoch.indexOf(ISO8601_TIME_DELIMITER) + 1);    // get the time part 
        isValid = isValid && (time.length == HOURS_LENGTH
            || time.length == MINUTES_LENGTH
            || time.length == SECONDS_LENGTH
            || time.length == MILLISECONDS_LENGTH);                               // enforce minimum length
    }

    return isValid
}

// returns the timeofday for the epoch
function timeOfDay(epoch) {

    let tod;
    let hr = moment.utc(epoch).get('hour');                     // get the hour

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
function periodFormatString(period, compressed) {

    let format;
    switch (period) {
        case enums.period.instant:
            format = compressed ? 'YYYYMMDDTHHmmss.SSS' : 'DD/MM/YY HHmmss.SSS';
            break;
        case enums.period.second:
            format = compressed ? 'YYYYMMDDTHHmmss' : 'DD/MM/YY HHmm:ss';
            break;
        case enums.period.minute:
            format = compressed ? 'YYYYMMDDTHHmm' : 'DD/MM/YY HH:mm';
            break;
        case enums.period.hour:
        case enums.period.timeofday:            // timofday formatted same as hour
            format = compressed ? 'YYYYMMDDTHHmm' : 'DD/MM/YY HH:mm';
            break;
        case enums.period.day:
        case enums.period.week:                 // week and day are the same
        case enums.period.month:                // quarter formatted same as month
        case enums.period.quarter:
        case enums.period.year:                 // year and fiveyear are the same
        case enums.period.fiveyear:
        default:                                // default is week 
            format = compressed ? 'YYYYMMDD' : 'DD/MM/YY';
            break;
    }

    return format;
};

// formats the date-time specifically for the period 
function periodFormat(instant, period) {

    const format = periodFormatString(enums.period[period], true);   // get the format string 
    return moment.utc(instant).format(format);                 // return formatted 

}

// formats the date-time for the title property 
function titleString(epoch, end, period) {

    const format = periodFormatString(enums.period[period], false);   // get the format string without copmpression

    let epochStr = moment.utc(epoch).format(format);
    let endStr = moment.utc(end).format(format);
    let titleStr = (epochStr == endStr) ? epochStr : `${epochStr} - ${endStr}`;
    return titleStr;                 // return formatted 

}


// returns a prompt based on the period and epoch
function periodPrompt(period, epoch) {

    let prompt;
    let year = moment(epoch).format('YYYY');
    switch (period) {

        case enums.period.second:               // Second 0906:24
            prompt = `Second ${moment(epoch).format('HHmm:ss')}`;
            break;

        case enums.period.minute:               // Minute 09:06
            prompt = `Minute ${moment(epoch).format('HH:mm')}`;
            break;

        case enums.period.timeofday:            // Jan 1 Morning 
            prompt = `${moment(epoch).format('MMM')} ${moment(epoch).format('D')} ${utils.capitalise(timeOfDay(epoch))}`;
            break;

        case enums.period.day:                  // 'Mon Jan 1st'
            prompt = `${moment(epoch).format('ddd')} ${moment(epoch).format('MMM')} ${moment(epoch).format('Do')}`
            break;

        case enums.period.month:                // 'March 2019'
            prompt = `${moment(epoch).format('MMMM')} ${year}`;
            break;

        case enums.period.quarter:              // 'Quarter 1 2019'
            prompt = `Quarter ${moment(epoch).quarter()} ${year}`;
            break;

        case enums.period.week:                 // Week 27 2019
            prompt = `Week ${moment(epoch).format('WW')} ${year}`;
            break;

        case enums.period.hour:                 // Hour 2100     
            prompt = `Hour ${moment(epoch).format('HH')}00`;
            break;

        case enums.period.year:                 // Year 2019
            prompt = `Year ${year}`;
            break;

        case enums.period.fiveyear:             // 5 Years 2014-2019
            prompt = `5 Years ${year}-${moment(epoch).add(5, 'years').format('YYYY')}`;
            break;

        case enums.period.instant:
        default:                                // default is week 
            prompt = utils.capitalise(period);
            break;
    }

    return prompt;
};


module.exports = Period;
