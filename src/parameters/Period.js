//@ts-check
"use strict";
/**
 * ./parameters/Period.js
 * An object to populate and traverse time periods 
 *  
 */
const moment = require('moment');

const enums = require('../definitions/enums');
const consts = require('../definitions/constants');
const utils = require('../definitions/utils');

const Param = require('./Param');
const MILLISECOND_FORMAT = datetimeFormatString(enums.period.instant, true);     // the default format, YYYYMMDDTHHmmss.SSS

/**
 * expects a date-time value in utc format. period is required (as a string) and must contain a complete date (isEpochValid())
 * checks to see if value is a valid time and sets default to current time if it is not.
 * the value is formatted according to the specified period (def.enum.period) argument 
 */

class Period extends Param {
    /**
     * attributes:  
     * super."name": "period", super."value": "week.day",
     *  "epochInstant": "20190204T000000.000", "endInstant": "20190204T235959.999",
     *  "duration": "7", "epoch": "20190204", "end": "20190204",
     *  "rel": "collection", "prompt": "Mon Feb 4th", "title": "04/02/19"
     * @param {*} period    // enums.period
     * @param {*} epoch     // date-time 
     * @param {*} duration  // positive integer
     */
    constructor(period, epoch, duration) {

        const PARAM_NAME = 'period';

        // period and duration 
        period = enums.period[period] ? period : enums.period.default;          // check if period is valid,  set default if it is not
        super(PARAM_NAME, period);                                              // e.g. name='period' value='week';' 
        this.duration = duration ? duration : consts.params.DEFAULT_DURATION;
        this.context = period;                                                  // by default context=period except in a collection and overwritten by getChild()

        // epoch and end millisecond timestamps                                 // validates and normalises the epoch and end for the supplied period and duration
        let valid = isEpochValid(epoch, MILLISECOND_FORMAT);                    // make sure epoch is a valid date-time 
        epoch = valid ? epoch : moment.utc().format(MILLISECOND_FORMAT);        // if not valid default to 'now'
        epoch = periodEpoch(period, epoch, MILLISECOND_FORMAT);                 // normalise the epoch to the exact start of the period
        //..
        this.epochInstant = epoch;
        this.endInstant = periodEnd(period, this.epochInstant, this.duration, MILLISECOND_FORMAT);   // period end - get the end date-time based on the epoch and duration 

        // epoch and end formatted timestamps
        this.epoch = datetimeFormat(this.epochInstant, period);                 // formatted for the period  
        this.end = datetimeFormat(this.endInstant, period);

        // hypermedia properties 
        this.rel = enums.linkRelations.self;                                    // default is 'self' this is overwritten for parent, child, etc
        this.prompt = periodPrompt(period, this.epochInstant);
        this.title = periodTitle(this.epochInstant, this.endInstant, period);   // "04/02/2019 - 10/02/2019";

    }


    // returns the next period 
    getNext() {

        // add a milisecond to the period end to make it the next period's epoch
        let epoch = moment.utc(this.endInstant).add(1, 'milliseconds').format(MILLISECOND_FORMAT);

        //create the period and sets its relationship
        const periodEnum = this.value;
        let next = new Period(periodEnum, epoch, consts.params.DEFAULT_DURATION);
        next.rel = enums.linkRelations.next;

        return next;

    }

    // returns the previous period 
    getPrev() {

        // subtract a milisecond from the period epoch to get the previous period's epoch
        let epoch = moment.utc(this.epochInstant).subtract(1, 'milliseconds').format(MILLISECOND_FORMAT);

        //create the period and sets its relationship
        const periodEnum = this.value;
        let prev = new Period(periodEnum, epoch, consts.params.DEFAULT_DURATION);
        prev.rel = enums.linkRelations.prev;

        return prev;

    }
    // returns the parent of this period 
    getParent() {

        let parent;

        // select the parent period enum
        const periodEnum = this.value;
        let parentEnum = consts.parentPeriod[periodEnum];

        if (parentEnum) {                                                           // fiveyear has no p[arent]    
            //create the period and sets its relationship
            parent = new Period(parentEnum, this.epochInstant, consts.params.DEFAULT_DURATION);
            parent.rel = enums.linkRelations.up;                                    // up is the rel for the parent
        }

        return parent;
    }

    // returns the child of this period including the duration = number of child periods in the period 
    getChild() {

        let child;

        // select the child period enum
        const periodEnum = this.value;
        let childEnum = consts.childPeriod[periodEnum];
        let duration;

        if (childEnum) {                                                            // e.g. instant has no child    

            // duration - get the number of child periods in the period 
            if ((periodEnum == enums.period.month) && (childEnum == enums.period.day)) {    // if monthday - number of days changes each month  
                duration = moment.utc(this.epochInstant).daysInMonth().toString();         // get the days for this month  
            } else {
                duration = consts.childDurations[`${periodEnum}${childEnum}`];              // eg. childDurations.weekday, returns 7
            }

            //col the period and sets its relationship
            child = new Period(childEnum, this.epochInstant, duration);             // construct with duration  
            child.context = `${periodEnum}.${childEnum}`                            // e.g. 'week.day' 
            child.rel = enums.linkRelations.collection;                             // collection is the rel for a child
        }

        return child;
    }

}


// returns an epoch adjusted for the start of the period
function periodEpoch(period, epoch, format) {

    switch (period) {

        // epoch format YYYYMMDDTHHmmss.SSS -----------------------------------              
        case enums.period.instant:

            epoch = moment.utc(epoch).format(format);                       // no adjustment - return milliseconds epoch (format YYYYMMDDTHHmmss.SSS)  
            break;

        case enums.period.timeofday:                                        // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   

            let hr = consts.timeOfDayStart[selectTimeOfDay(epoch)];         // get the starting hour for the timeofday     
            epoch = moment.utc(epoch).set('hour', hr).format(format);       // set hour to 0,6,12,or 18

            epoch = moment.utc(epoch).set('minute', 0).format(format);      // set minute, second, millisecond to zero
            epoch = moment.utc(epoch).set('second', 0).format(format);
            epoch = moment.utc(epoch).set('millisecond', 0).format(format);

            break;

        // epoch format YYYYMMDD -----------------------------------------
        case enums.period.week:                         // adjust to start of the week

            epoch = moment.utc(epoch).startOf('isoWeek').format(format);    // adjust to monday (iso week starts on monday)
            break;

        case enums.period.fiveyear:                     // adjust to start of last 5 year block (2010, 2015, 2020 etc.)

            let yr = moment.utc(epoch).get('year');     // get the year
            yr = yr - (yr % 5);                         // round down to nearest 5 year epoch
            epoch = moment.utc(epoch).set('year', yr).format(format);       // set year
            epoch = moment.utc(epoch).startOf('year').format(format);       // set to January 1st of that year
            break;

        case enums.period.hour:
        case enums.period.minute:
        case enums.period.second:
        case enums.period.day:
        case enums.period.month:
        case enums.period.quarter:
        case enums.period.year:
            epoch = moment.utc(epoch).startOf(period).format(format);       // get the start of the period 
            break;

    }

    return epoch;

}

// returns the end of the period based on its epoch and duration 
function periodEnd(period, epoch, duration, format) {

    let periodEnd;
    let periodsToAdd = (duration - 1);                      // add these periods to the period to get the end of the duration which starts at epoch

    switch (period) {

        case enums.period.instant:
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'milliseconds').format(format);
            break;

        case enums.period.timeofday:                        // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   
            const TIMEOFDAY_DURATION_HRS = 6;                                                           // hours

            periodsToAdd = (duration * TIMEOFDAY_DURATION_HRS) - 1;                                     // add at least one for tod to get to the endOf its period
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'hours').endOf('hour').format(format);
            break;

        case enums.period.week:
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'weeks').endOf('isoWeek').format(format);   // has to be isoWeek
            break;

        case enums.period.fiveyear:                         // add 5 years to epoch
            const FIVEYEAR_DURATION_YRS = 5;                // years
            periodsToAdd = (duration * FIVEYEAR_DURATION_YRS) - 1;                                      // add at least one for 5yr to get to the endOf its period
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'years').endOf('year').format(format);      // add duration for 5yr to get to the endOf its period
            break;

        case enums.period.hour:
        case enums.period.minute:
        case enums.period.second:
        case enums.period.day:
        case enums.period.month:
        case enums.period.quarter:
        case enums.period.year:
            // @ts-ignore
            periodEnd = moment.utc(epoch).add(periodsToAdd, `${period}s`).endOf(period).format(format);
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
    if (epoch.indexOf(ISO8601_TIME_DELIMITER) >= 0) {                               // if there is a time component
        date = epoch.substring(0, epoch.indexOf(ISO8601_TIME_DELIMITER) + 1);       // get the date part
    }

    let isValid = (moment.utc(date, format).isValid());
    isValid = isValid && (date.length >= MIN_DATE_LENGTH);                          // enforce minimum length

    //check if time is valid 
    if (epoch.indexOf(ISO8601_TIME_DELIMITER) >= 0) {                               // if there is a time component
        let time = epoch.substring(epoch.indexOf(ISO8601_TIME_DELIMITER) + 1);      // get the time part 
        isValid = isValid && (time.length == HOURS_LENGTH
            || time.length == MINUTES_LENGTH
            || time.length == SECONDS_LENGTH
            || time.length == MILLISECONDS_LENGTH);                                 // enforce minimum length
    }

    return isValid
}

// select the timeofday enum for the epoch
function selectTimeOfDay(epoch) {

    let tod;
    let hr = moment.utc(epoch).get('hour');                     // get the hour of the epoch

    const hrTod = consts.timeOfDayStart;                        // hour constants

    if (hr >= parseInt(hrTod.night) && hr < parseInt(hrTod.morning)) {
        tod = enums.timeOfDay.night;

    } else if (hr >= parseInt(hrTod.morning) && hr < parseInt(hrTod.afternoon)) {
        tod = enums.timeOfDay.morning;

    } else if (hr >= parseInt(hrTod.afternoon) && hr < parseInt(hrTod.evening)) {
        tod = enums.timeOfDay.afternoon;

    } else {
        tod = enums.timeOfDay.evening;
    }
    return tod;
}

// returns a format string for UTC time corresponding to the specified period. 
function datetimeFormatString(period, compressed) {
    // compresed format is used in links and identifiers, the uncompressed format is for display rendering 
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
function datetimeFormat(instant, period) {

    const format = consts.periodDatetimeISO[period];                    // get the comnpressed format string 
    return moment.utc(instant).format(format);                          // return formatted 

}

// returns a formatted string for the title property ("04/02/2019 - 10/02/2019")
function periodTitle(epoch, end, period) {

    const format = consts.periodDatetimeGeneral[period];                // get the format string without copmpression

    let epochStr = moment.utc(epoch).format(format);
    let endStr = moment.utc(end).format(format);
    let titleStr = (epochStr == endStr) ? epochStr : `${epochStr} - ${endStr}`;
    return titleStr;                 // return formatted 

}

// returns a string for the prompt property based on the period and epoch ("Week 13 2019")
function periodPrompt(period, epoch) {

    let prompt;
    let year = moment.utc(epoch).format('YYYY');
    switch (period) {

        case enums.period.instant:
            prompt = `Instant ${moment.utc(epoch).format('HHmmss.SSS')}`;
            break;

        case enums.period.second:               // Second 0906:24
            prompt = `Second ${moment.utc(epoch).format('HHmm:ss')}`;
            break;

        case enums.period.minute:               // Minute 09:06
            prompt = `Minute ${moment.utc(epoch).format('HH:mm')}`;
            break;

        case enums.period.timeofday:            // Jan 1 Morning 
            prompt = `${moment.utc(epoch).format('MMM')} ${moment.utc(epoch).format('D')} ${utils.capitalise(selectTimeOfDay(epoch))}`;
            break;

        case enums.period.day:                  // 'Mon Jan 1st'
            prompt = `${moment.utc(epoch).format('ddd')} ${moment.utc(epoch).format('MMM')} ${moment.utc(epoch).format('Do')}`
            break;

        case enums.period.month:                // 'Mar 2019'
            prompt = `${moment.utc(epoch).format('MMM')} ${year}`;
            break;

        case enums.period.quarter:              // 'Quarter 1 2019'
            prompt = `Quarter ${moment.utc(epoch).quarter()} ${year}`;
            break;

        case enums.period.week:                 // Week 27 2019
            prompt = `Week ${moment.utc(epoch).format('WW')} ${year}`;
            break;

        case enums.period.hour:                 // Hour 2100     
            prompt = `Hour ${moment.utc(epoch).format('HH')}00`;
            break;

        case enums.period.year:                 // Year 2019
            prompt = `Year ${year}`;
            break;

        case enums.period.fiveyear:             // 5 Years 2014-2019
            prompt = `5 Years ${year}-${moment.utc(epoch).add(5, 'years').format('YYYY')}`;
            break;

        default:                                // default is week 
            prompt = utils.capitalise(period);
            break;
    }

    return prompt;
};


module.exports = Period;
