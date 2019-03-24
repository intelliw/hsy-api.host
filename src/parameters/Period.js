//@ts-check
"use strict";
/**
 * ./parameters/Period.js
 * An object to populate and traverse time periods 
 *  
 */
const moment = require('moment');

const enums = require('../system/enums');
const consts = require('../system/constants');
const utils = require('../system/utils');

const Param = require('./Param');
const MILLISECOND_FORMAT = consts.periodDatetimeISO.instant;                    // the default format, YYYYMMDDTHHmmss.SSS

/**
 * expects a date-time value in utc format. period is required (as a string) and must contain a complete date (isEpochValid())
 * checks to see if value is a valid time and sets default to current time if it is not.
 * the value is formatted according to the specified period (def.enum.period) argument 
 */
class Period extends Param {
    /**
    attributes:  
     super.name: "period", 
     super.value: "week",
     "context": "week.day",
     "epochInstant": "20190204T000000.000", "endInstant": "20190204T235959.999",
     "epoch": "20190204", "end": "20190204",
     "duration": "7",
     "rel": "collection", 
     "prompt": "Mon Feb 4th-Sun Feb 10th", "title": "04/02/19 - 10/02/19"
     "render": "link", 
     "_links: []"
     "_children: []"
    * @param {*} period    // enums.period
    * @param {*} epoch     // date-time 
    * @param {*} duration  // positive integer
    */
    constructor(period, epoch, duration) {

        const PARAM_NAME = 'period';

        // period and duration 
        period = enums.period[period] ? period : enums.period.default;          // check if period is valid,  set default if it is not
        super(PARAM_NAME, period);                                              // e.g. name='period' value='week';' 
        this.duration = duration ? duration : consts.DEFAULT_DURATION;
        this.context = period;                                                  // by default context=period except in a collection and overwritten by getChild()

        // epoch and end millisecond timestamps                                 // validates and normalises the epoch and end for the supplied period and duration
        let valid = isEpochValid(epoch, MILLISECOND_FORMAT);                    // make sure epoch is a valid date-time 
        epoch = valid ? epoch : moment.utc().format(MILLISECOND_FORMAT);        // if not valid default to 'now'
        epoch = periodEpoch(period, epoch, MILLISECOND_FORMAT);                 // normalise the epoch to the exact start of the period
        //..
        this.epochInstant = epoch;
        this.endInstant = periodEnd(period, this.epochInstant, this.duration, MILLISECOND_FORMAT);   // period end - get the end date-time based on the epoch and duration 

        // epoch and end formatted timestamps
        this.epoch = datetimeFormatISO(this.epochInstant, period);              // format for the period  
        this.end = datetimeFormatISO(this.endInstant, period);

        // hypermedia properties 
        this.rel = enums.linkRelations.self;                                    // default is 'self' this is overwritten for parent, child, etc after construction
        this.prompt = periodPrompt(this.epochInstant, this.endInstant, period);
        this.title = periodTitle(this.epochInstant, this.endInstant, period);   // "04/02/2019 - 10/02/2019";
        this.render = enums.linkRender.default;                                 // default is 'none'

        // data arrays
        this._links = global.undefined;                                         // undefined until requested through links()
        this._children = global.undefined;                                      // undefined until requested through links()

    }
    // returns the linked periods i.e self, child, parent, next, previous. Use links() to populate and retrieve these in the _links private variable 
    links() {

        // get the links for the first time only    
        if (!this._links) {
            this._links = periodLinks(this);
        }

        return this._links;
    }

    // returns the array of children. Use children() function to populate and retrieve these through the _children private variable 
    children() {

        // get the children for the first time only    
        if (!this._children) {
            this._children = periodChildren(this);
        }

        return this._children;
    }
    // returns the next period 
    getNext() {

        // add a milisecond to the period end to make it the next period's epoch
        let epoch = moment.utc(this.endInstant).add(1, 'milliseconds').format(MILLISECOND_FORMAT);

        //create the period and sets its relationship
        const periodEnum = this.value;
        let next = new Period(periodEnum, epoch, consts.DEFAULT_DURATION);
        next.rel = enums.linkRelations.next;
        next.render = enums.linkRender.link;                                    // should be rendered as a link

        return next;

    }

    // returns the previous period 
    getPrev() {

        // subtract a milisecond from the period epoch to get the previous period's epoch
        let epoch = moment.utc(this.epochInstant).subtract(1, 'milliseconds').format(MILLISECOND_FORMAT);

        //create the period and sets its relationship
        const periodEnum = this.value;
        let prev = new Period(periodEnum, epoch, consts.DEFAULT_DURATION);
        prev.rel = enums.linkRelations.prev;
        prev.render = enums.linkRender.link;                                    // should be rendered as a link

        return prev;

    }

    // returns the parent of this period 
    getParent() {

        let parent;

        // select the parent period enum
        const periodEnum = this.value;
        let parentEnum = consts.periodParent[periodEnum];

        if (parentEnum) {                                                       // fiveyear has no p[arent]    
            //create the period and sets its relationship
            parent = new Period(parentEnum, this.epochInstant, consts.DEFAULT_DURATION);
            parent.rel = enums.linkRelations.up;                                // up is the rel for the parent
            parent.render = enums.linkRender.link;                              // should be rendered as a link
        }

        return parent;
    }

    // returns a clone of the period 
    getClone() {

        // add a milisecond to the period end to make it the next period's epoch
        const epoch = this.epoch;
        const periodEnum = this.value;

        //create the clone and sets its relationship
        let clone = new Period(periodEnum, epoch, consts.DEFAULT_DURATION);

        clone.context = this.context
        clone.epochInstant = this.epochInstant
        clone.endInstant = this.endInstant
        clone.epoch = this.epoch
        clone.end = this.end
        clone.duration = this.duration
        clone.rel = this.rel
        clone.prompt = this.prompt
        clone.title = this.title

        return clone;

    }

    // returns each individual period in the duration in an array. Each period in the array will have a duration of 1, and there will be as many objects in the array as the original period's duration 
    getEach() {


        let periods = [];
        const duration = this.duration;
        const period = this.value;

        const RENDER = enums.linkRender.link;

        // create the first one  
        let newPeriod = new Period(period, this.epochInstant, consts.DEFAULT_DURATION);


        let p;
        for (p = 1; p <= duration; p++) {

            newPeriod.render = RENDER;                  // set a consistent render value for the whole array 
            periods.push(newPeriod);                    // add to the array
            newPeriod = newPeriod.getNext();            // get the next 

        }

        return periods;

    }

    // returns the child of this period including the duration, which is the number of child periods in the period 
    getChild() {

        let child;

        // select the child period enum
        const periodEnum = this.value;
        let childEnum = consts.periodChild[periodEnum];
        let duration;

        if (childEnum) {                                                            // e.g. instant has no child    

            // duration - get the number of child periods in the period 
            if ((periodEnum == enums.period.month) && (childEnum == enums.period.day)) {    // if monthday - number of days changes each month  
                duration = moment.utc(this.epochInstant).daysInMonth().toString();          // get the days for this month  
            } else {
                duration = consts.periodChildDuration[`${periodEnum}${childEnum}`];              // eg. childDurations.weekday, returns 7
            }

            //col the period and sets its relationship
            child = new Period(childEnum, this.epochInstant, duration);             // construct child with a duration  
            child.context = `${periodEnum}.${childEnum}`                            // context is period to child  e.g. 'week.day' 
            child.rel = enums.linkRelations.collection;                             // collection is the rel for a child
        }

        return child;
    }

}

// returns each individual period for the duration of the child period of this period. Each period in the array will have a duration of 1, and there will be as many objects in the array as the original child period's duration 
function periodChildren(period) {

    let childperiods = [];
    let child = period.getChild();

    // if there is a child
    if (child) {
        childperiods = child.getEach();
    }

    return childperiods;

}

// returns an array of linked periods i.e self, child, parent, next, previous 
function periodLinks(period) {

    let links = [];

    let child = period.getChild();                  // e.g. fiveyear has no child
    let parent = period.getParent();                // e.g. instant has no parent

    // create the links
    links.push(period);                             // self
    if (child) links.push(child);                   // child
    if (parent) links.push(parent);                 // parent
    links.push(period.getNext());                   // next
    links.push(period.getPrev());                   // prev

    return links;
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

// formats the instant in compressed ISO datetime format
function datetimeFormatISO(instant, period) {

    const format = consts.periodDatetimeISO[period];                    // get the comnpressed format string 
    return moment.utc(instant).format(format);                          // return formatted 

}

// formats the instant in general datetime format
function datetimeFormatGeneral(instant, period) {

    const format = consts.periodDatetimeGeneral[period];                // get the format string without copmpression
    return moment.utc(instant).format(format);                          // return formatted 

}

// returns a formatted string for the title property ("04/02/2019 - 10/02/2019")
function periodTitle(epoch, end, period) {

    let epochStr = datetimeFormatGeneral(epoch, period);
    let endStr = datetimeFormatGeneral(end, period);
    let titleStr = (epochStr == endStr) ? epochStr : `${epochStr} - ${endStr}`;
    return titleStr;                                                    // return formatted title

}

// returns a formatted string for the prompt property (e.g. "Week 13 2019" or "Week 13 2019 - Week 13 2019" if duration is > 1 )
function periodPrompt(epoch, end, period) {

    let epochStr = datetimeLabel(epoch, period);
    let endStr = datetimeLabel(end, period);
    let promptStr = (epochStr == endStr) ? epochStr : `${epochStr} - ${endStr}`;
    return promptStr;                                                    // return formatted title

};

// returns a formatted label for the period and instant  (e.g. "Week 13 2019")
function datetimeLabel(instant, period) {
    let label;
    let year = moment.utc(instant).format('YYYY');
    switch (period) {

        case enums.period.instant:              // 'Instant 090623.554'
            label = `Instant ${moment.utc(instant).format('HHmmss.SSS')}`;
            break;

        case enums.period.second:               // 'Second 0906:24'
            label = `Second ${moment.utc(instant).format('HHmm:ss')}`;
            break;

        case enums.period.minute:               // 'Minute 09:06'
            label = `Minute ${moment.utc(instant).format('HH:mm')}`;
            break;

        case enums.period.timeofday:            // 'Jan 1 Morning' 
            label = `${moment.utc(instant).format('MMM')} ${moment.utc(instant).format('D')} ${utils.capitalise(selectTimeOfDay(instant))}`;
            break;

        case enums.period.day:                  // 'Mon Jan 1st'
            label = `${moment.utc(instant).format('ddd')} ${moment.utc(instant).format('MMM')} ${moment.utc(instant).format('Do')}`
            break;

        case enums.period.month:                // 'Mar 2019'
            label = `${moment.utc(instant).format('MMM')} ${year}`;
            break;

        case enums.period.quarter:              // 'Quarter 1 2019'
            label = `Qtr ${moment.utc(instant).quarter()} ${year}`;
            break;

        case enums.period.week:                 // 'Week 27 2019'
            label = `Week ${moment.utc(instant).format('WW')} ${year}`;
            break;

        case enums.period.hour:                 // 'Hour 2100'
            label = `Hour ${moment.utc(instant).format('HH')}00`;
            break;

        case enums.period.year:                 // 'Year 2019'
            label = `Year ${year}`;
            break;

        case enums.period.fiveyear:             // '5 Years 2014-2019'
            label = `5 Years ${year}-${moment.utc(instant).add(5, 'years').format('YYYY')}`;
            break;

        default:
            label = utils.capitalise(period);
            break;
    }
    return label;
}
module.exports = Period;
