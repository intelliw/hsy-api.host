//@ts-check
"use strict";
/**
 * ./parameters/Period.js
 * An object to populate and traverse time periods 
 *  
 */
const moment = require('moment');

const enums = require('../environment/enums');
const consts = require('../host/constants');
const utils = require('../environment/utils');

const Param = require('./Param');
const MILLISECOND_FORMAT = consts.period.datetimeISO.instant;                                    // the default format, YYYYMMDDTHHmmss.SSS
const THIS_PARAM_NAME = 'period';


/**
 * expects a date-time value in utc format. period.value is required (as a string) and must contain a complete date (isEpochValid() === true)
 * checks to see if value is a valid time and sets default to current time if it is not.
 * the value is formatted according to the specified period (def.enum.period) argument 
 */
class Period extends Param {
    /**
    instance attributes:  
     super.name: "period", 
     super.value: "week",
     super.isValid: true,
     "parent": "month",
     "grandparent": "year",
     "context": "week.day",
     "epochInstant": "20190204T000000.000", 
     "endInstant": "20190204T235959.999",
     "epoch": "20190204", 
     "end": "20190204",
     "duration": "7",
     "rel": "collection", 
     "prompt": "Mon Feb 4th-Sun Feb 10th", 
     "title": "04/02/19 - 10/02/19"
     "description": "Mon Tue Wed Thu Fri Sat Sun"         ..if period retrieved through get Child() otherwise undefined
    
     constructor arguments  
    * @param {*} reqPeriod      // enums.params.period             e.g. 'week'
    * @param {*} epoch          // date-time 
    * @param {*} duration       // positive integer
    */
    constructor(reqPeriod, epoch, duration = consts.params.defaults.duration) {

        // period, context
        super(THIS_PARAM_NAME, reqPeriod, enums.params.period.default, enums.params.period);                  // e.g. reqPeriod' ='week';' 
        this.context = this.value;
        this.parent = consts.NONE;                   // getChild sets this after construction
        this.grandparent = consts.NONE;              // getChild sets this after construction

        // duration     
        this.duration = duration;

        // epoch and end millisecond timestamps                                                 // validates and normalises the epoch and end for the supplied period and duration
        let valid = isEpochValid(epoch, MILLISECOND_FORMAT);                                    // make sure epoch is a valid date-time 
        epoch = valid ? epoch : moment.utc().format(MILLISECOND_FORMAT);                        // if not valid default to 'now'
        epoch = periodEpoch(this.value, epoch, MILLISECOND_FORMAT);                             // normalise the epoch to the exact start of the period
        //..
        this.epochInstant = epoch;
        this.endInstant = periodEnd(this.value, this.epochInstant, this.duration, MILLISECOND_FORMAT);   // period end - get the end date-time based on the epoch and duration 

        // epoch and end formatted timestamps
        this.epoch = datetimeFormatISO(this.epochInstant, this.value);                          // format for the period  
        this.end = datetimeFormatISO(this.endInstant, this.value);

        // hypermedia properties 
        this.rel = enums.linkRelations.self;                                                    // default is 'self' this is overwritten for parent, child, etc after construction
        this.prompt = periodPrompt(this.epochInstant, this.endInstant, this.value);

        this.title = periodTitle(this.epochInstant, this.endInstant, this.value);               // "04/02/2019 - 10/02/2019";
        this.description = consts.NONE;                                                         // by default label is undefined except in a collection and overwritten by get Child() after construction

        // data arrays
        this._links = consts.NONE;                                                              // undefined until requested through links()
    }

    // the child period's description wil be added (if one has been configured for it in consts.period.childDescription)
    addDescription() {

        // get the description label e.g.  'Mon Tue Wed Thu Fri Sat Sun'            
        let descr = parentChildDescription(this);

        this.description = descr;

    }

    // checks if the period epoch is in the future
    isFutureEpoch() {
        let isFuture = moment.utc(this.epochInstant).isAfter()                                  // leave the args for IsAfter blank -- that'll default to now.
        return isFuture;
    }

    // returns true if this is a time-based period (hour minute etc) false if it is a date period (timeofday day month year etc)
    isTimePeriod() {
        const MAX_DATE_PERIOD_EPOCH_LENGTH = consts.period.datetimeISO.day.length;
        const isTime = this.epoch.length > MAX_DATE_PERIOD_EPOCH_LENGTH;

        return isTime;                  // timeofday is also considered a time period
    }

    // returns the next period 
    getNext() {

        // add a millisecond to the end of this period to get the start of the next period
        let epoch = moment.utc(this.endInstant).add(1, 'milliseconds').format(MILLISECOND_FORMAT);

        //create the period and sets its relationship
        const periodEnum = this.value;
        let next = new Period(periodEnum, epoch, consts.params.defaults.duration);
        next.rel = enums.linkRelations.next;

        return next;

    }

    // returns the previous period 
    getPrev() {

        // subtract a milisecond from the period epoch to get an instant from the previous period
        let epoch = moment.utc(this.epochInstant).subtract(1, 'milliseconds').format(MILLISECOND_FORMAT);

        //create the period and sets its relationship
        const periodEnum = this.value;
        let prev = new Period(periodEnum, epoch, consts.params.defaults.duration);
        prev.rel = enums.linkRelations.prev;

        return prev;

    }

    // returns a parent object for this period 
    getParent() {

        let parent = this.parent;
        let self = this.value;

        // select the parent period enum based on a descendent-parent lookop
        let parentEnum = consts.period.descendentParent[`${parent ? parent : ''}${self}`];

        if (parentEnum) {                                                                       // fiveyear has no p[arent]    
            //create the period and sets its relationship
            parent = new Period(parentEnum, this.epochInstant, consts.params.defaults.duration);
            parent.rel = enums.linkRelations.up;                                                // up is the rel for the parent
        }

        return parent;
    }

    // returns a clone of the period 
    getClone() {

        // add a milisecond to the period end to make it the next period's epoch
        const epoch = this.epoch;
        const periodEnum = this.value;

        //create the clone and sets its relationship
        let clone = new Period(periodEnum, epoch, consts.params.defaults.duration);

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
        const periodEnum = this.value;

        let p;

        const duration = this.duration;
        let epoch = this.epoch;

        for (p = 1; p <= duration; p++) {

            // create a period object and add it to the array 
            let period = new Period(periodEnum, epoch, consts.params.defaults.duration);
            period.parent = this.parent;
            period.grandparent = this.grandparent;
            period.context = this.context;

            periods.push(period);                    // add to the array

            // get the next epoch - add a millisecond to the end of this period to get the epoch (start) of the next period
            epoch = moment.utc(period.endInstant).add(1, 'milliseconds').format(MILLISECOND_FORMAT);

        }

        return periods;
    }

    // returns the child of this period including the duration, which is the number of child periods in the period 
    getChild(withDescription) {


        let child;
        let duration;

        // get ancestry
        let parent = this.value;
        let grandparent = this.parent;                                                      // grandparent is presents only if a child creates a child

        // lookup child period
        let childMap = consts.period.ancestorChild[`${grandparent ? grandparent : ''}${parent}`];
        let childEnum = childMap.c;

        if (childEnum) {                                                                    // e.g. instant has no child    

            // duration - if monthday get the nubmer of days for the month
            if (parent == enums.params.period.month && childEnum == enums.params.period.day) {
                duration = monthdayDuration(this.epochInstant)
            } else {
                duration = childMap.d;
            }

            // if grandchild calculate total duration including parent                      // e.g 28 if perent (week.day) is 7 and child (day.timeofday) is 4 
            if (grandparent) {
                duration = Number(this.duration) * Number(duration);
            }

            //set child props and relationship
            child = new Period(childMap.c, this.epochInstant, duration);                    // construct child with a duration  
            child.parent = parent;
            child.grandparent = grandparent;
            child.context = `${parent}.${childEnum}`                                        // context is parent to this (i.e child)  e.g. 'week.day' 
            child.rel = enums.linkRelations.collection;                                     // collection is the rel for a child or grandchild
            child.description = consts.NONE;                                                // default is no description use add Description() to add one later 

        }

        return child;
    }

    // returns each individual period for the duration of this period's child period . Each period in the array will have a duration of 1, and there will be as many objects in the array as the original child period's duration 
    getEachChild() {

        let childperiods = [];

        let child = this.getChild();

        // if there is a child
        if (child) {
            childperiods = child.getEach();
        }

        return childperiods;
    }


}

// returns an epoch adjusted for the start of the period
function periodEpoch(periodEnum, epoch, format) {

    switch (periodEnum) {

        // epoch format YYYYMMDDTHHmmss.SSS -----------------------------------              
        case enums.params.period.instant:

            epoch = moment.utc(epoch).format(format);                                       // no adjustment - return milliseconds epoch (format YYYYMMDDTHHmmss.SSS)  
            break;

        case enums.params.period.timeofday:                                                        // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   

            let hr = consts.timeOfDayStart[selectTimeOfDayEnum(epoch)];                         // get the starting hour for the timeofday     
            epoch = moment.utc(epoch).set('hour', hr).format(format);                       // set hour to 0,6,12,or 18

            epoch = moment.utc(epoch).set('minute', 0).format(format);                      // set minute, second, millisecond to zero
            epoch = moment.utc(epoch).set('second', 0).format(format);
            epoch = moment.utc(epoch).set('millisecond', 0).format(format);

            break;

        // epoch format YYYYMMDD -----------------------------------------
        case enums.params.period.week:                                                             // adjust to start of the week

            epoch = moment.utc(epoch).startOf('isoWeek').format(format);                    // adjust to monday (iso week starts on monday)
            break;

        case enums.params.period.fiveyear:                                                         // adjust to start of last 5 year block (2010, 2015, 2020 etc.)

            let yr = moment.utc(epoch).get('year');                                         // get the year
            yr = yr - (yr % 5);                                                             // round down to nearest 5 year epoch
            epoch = moment.utc(epoch).set('year', yr).format(format);                       // set year
            epoch = moment.utc(epoch).startOf('year').format(format);                       // set to January 1st of that year
            break;

        case enums.params.period.hour:
        case enums.params.period.minute:
        case enums.params.period.second:
        case enums.params.period.day:
        case enums.params.period.month:
        case enums.params.period.quarter:
        case enums.params.period.year:
            epoch = moment.utc(epoch).startOf(periodEnum).format(format);                   // get the start of the period 
            break;
    }
    return epoch;
}

// returns the end of the period based on its epoch and duration 
function periodEnd(periodEnum, epoch, duration, format) {

    let periodEnd;
    let periodsToAdd = (duration - 1);                                                      // add these periods to the period to get the end of the duration which starts at epoch

    switch (periodEnum) {

        case enums.params.period.instant:
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'milliseconds').format(format);
            break;

        case enums.params.period.timeofday:                        // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   
            const TIMEOFDAY_DURATION_HRS = 6;                                                           // hours

            periodsToAdd = (duration * TIMEOFDAY_DURATION_HRS) - 1;                                     // add at least one for tod to get to the endOf its period
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'hours').endOf('hour').format(format);
            break;

        case enums.params.period.week:
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'weeks').endOf('isoWeek').format(format);   // has to be isoWeek
            break;

        case enums.params.period.fiveyear:                         // add 5 years to epoch
            const FIVEYEAR_DURATION_YRS = 5;                // years

            periodsToAdd = (duration * FIVEYEAR_DURATION_YRS) - 1;                                          // add at least one for 5yr to get to the endOf its period
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'years').endOf('year').format(format);      // add duration for 5yr to get to the endOf its period

            break;

        case enums.params.period.hour:
        case enums.params.period.minute:
        case enums.params.period.second:
        case enums.params.period.day:
        case enums.params.period.month:
        case enums.params.period.quarter:
        case enums.params.period.year:
            // @ts-ignore
            periodEnd = moment.utc(epoch).add(periodsToAdd, `${periodEnum}s`).endOf(periodEnum).format(format);
            break;
    }

    return periodEnd;

}

// returns the number (as a string) of child periods in the period 
function monthdayDuration(epochInstant) {

    let duration = moment.utc(epochInstant).daysInMonth().toString();               // get the days for this month  

    return duration;

}

// returns the labels to display as headers for child periods.
function parentChildDescription(periodObj) {

    let descr;
    const SPACE_DELIMITER = ' ';

    // the lookup is parent-self e.g. weekday
    let parent = periodObj.parent;
    let self = periodObj.value
    let epochInstant = periodObj.epochInstant;

    if (parent) {

        descr = consts.period.childDescription[`${parent}${self}`]

        switch (`${parent}${self}`) {


            // custom lookups for these period/children         
            case 'timeofdayhour':                   // timeofdayhour                    // '{ 'morning': '06 07 08 09 10 11', 'afternoon': '12 13 ... 

                let todLbl = selectTimeOfDayEnum(epochInstant);                         //  enums.timeOfDay.morning     
                descr = descr[todLbl];                                                  //  extract subvalue from label e.g. '06 07 08 09 10 11'
                break;

            case 'quartermonth':                    // quartermonth                     // { 'Q1': 'Jan Feb Mar', 'Q2': 'Apr May ...

                let qtrLbl = selectQuarterLabel(epochInstant);                          //  Q1
                descr = descr[qtrLbl];                                                  //  extract subvalue from label e.g. 'Jan Feb Mar'

                break;

            case 'monthday':                                                            // monthday         

                const DEFAULT_START = 1;

                let duration = moment.utc(epochInstant).daysInMonth();                  // get the days for this month  
                let start = descr ? (descr.split(SPACE_DELIMITER).length) + 1 : DEFAULT_START; // get the days in the constant - this should be 28

                let howMany = (duration - start) + 1;

                descr = utils.createSequence(start, howMany, SPACE_DELIMITER, descr);

                break;

            case 'fiveyearyear':                    // fiveyearyear

                let year = moment.utc(epochInstant).format('YYYY');
                descr = utils.createSequence(year, 5, SPACE_DELIMITER);

                break;

            // literals from the constant for the rest of the period/children
            default:
                break;

        }
    }
    return descr;

}

// returns a formatted string for the title property ("04/02/2019 - 10/02/2019")
function periodTitle(epoch, end, periodEnum) {

    let epochStr = datetimeFormatGeneral(epoch, periodEnum);
    let endStr = datetimeFormatGeneral(end, periodEnum);
    let titleStr = (epochStr == endStr) ? epochStr : `${epochStr} - ${endStr}`;
    return titleStr;                                                                    // return formatted title

}

// returns a formatted string for the prompt property (e.g. "Week 13 2019" or "Week 13 2019 - Week 13 2019" if duration is > 1 )
function periodPrompt(epoch, end, periodEnum) {

    let epochPromptStr = datetimePromptStr(epoch, periodEnum);
    let endPromptStr = datetimePromptStr(end, periodEnum);

    // ignore end period for five year
    let prompt = (epochPromptStr == endPromptStr) ? epochPromptStr : `${epochPromptStr} - ${endPromptStr}`;

    return prompt;                                                                      // return formatted title

};



// checks if the epoch is a valid date-time
function isEpochValid(epoch, format) {

    const MIN_DATE_LENGTH = 8;                                                          // epoch must be at least 8 characters (e.g 20181202)

    const HOURS_LENGTH = 2;                                                             // hour must 2 characters (e.g 12)
    const MINUTES_LENGTH = 4;                                                           // minutes must be 4 characters (e.g 1200)
    const SECONDS_LENGTH = 6;                                                           // secondss must be 6 characters (e.g 120050)
    const MILLISECONDS_MIN_LENGTH = 10;                                                 // if 3 digit millseconds, the time value must be at least 10 characters (e.g 120050.233)

    const ISO8601_TIME_DELIMITER = 'T';

    let isValid;

    // check if date is valid. 
    if (epoch) {                                                                        // first check if there was a date     
        let date = epoch;
        if (epoch.indexOf(ISO8601_TIME_DELIMITER) >= 0) {                               // if there is a time component
            date = epoch.substring(0, epoch.indexOf(ISO8601_TIME_DELIMITER) + 1);       // get the date part
        }

        isValid = (moment.utc(date, format).isValid());
        isValid = isValid && (date.length >= MIN_DATE_LENGTH);                          // enforce minimum length

        //check if time is valid 
        if (epoch.indexOf(ISO8601_TIME_DELIMITER) >= 0) {                               // if there is a time component
            let time = epoch.substring(epoch.indexOf(ISO8601_TIME_DELIMITER) + 1);      // get the time part 
            isValid = isValid && (time.length == HOURS_LENGTH
                || time.length == MINUTES_LENGTH
                || time.length == SECONDS_LENGTH
                || time.length >= MILLISECONDS_MIN_LENGTH);                             // enforce minimum length of ms
        }
    }
    return isValid
}

// select the quarter label (eg 'Q1' for the year of the epoch
function selectQuarterLabel(epoch) {

    const QUARTER_PREFIX = 'Q';

    let qtrNum = moment.utc(epoch).quarter();
    let qtrLbl = `${QUARTER_PREFIX}${qtrNum}`;          // Q1

    return qtrLbl;
}

// select the timeofday enum for the epoch
function selectTimeOfDayEnum(epoch) {

    let todEnum;
    let hr = moment.utc(epoch).get('hour');                                             // get the hour of the epoch

    const hrTod = consts.timeOfDayStart;                                                // hour constants

    if (hr >= parseInt(hrTod.night) && hr < parseInt(hrTod.morning)) {
        todEnum = enums.timeOfDay.night;

    } else if (hr >= parseInt(hrTod.morning) && hr < parseInt(hrTod.afternoon)) {
        todEnum = enums.timeOfDay.morning;

    } else if (hr >= parseInt(hrTod.afternoon) && hr < parseInt(hrTod.evening)) {
        todEnum = enums.timeOfDay.afternoon;

    } else {
        todEnum = enums.timeOfDay.evening;
    }
    return todEnum;
}

// formats the instant in compressed ISO datetime format. Period enum determines the format
function datetimeFormatISO(instant, periodEnum) {

    const format = consts.period.datetimeISO[periodEnum];                                // get the comnpressed format string 
    return moment.utc(instant).format(format);                                          // return formatted 

}


// formats the instant in general datetime format
function datetimeFormatGeneral(instant, periodEnum) {

    const format = consts.period.datetimeGeneral[periodEnum];                            // get the format string without copmpression
    return moment.utc(instant).format(format);                                          // return formatted 

}


// returns a formatted label for the period and instant  (e.g. "Week 13 2019")
function datetimePromptStr(instant, periodEnum) {
    let label;
    let year = moment.utc(instant).format('YYYY');
    switch (periodEnum) {

        case enums.params.period.instant:              // 'Instant 090623.554'
            label = `Instant ${moment.utc(instant).format('HHmmss.SSS')}`;
            break;
        case enums.params.period.second:               // 'Second 0906:24'
            label = `Second ${moment.utc(instant).format('HHmm:ss')}`;
            break;
        case enums.params.period.minute:               // 'Minute 09:06'
            label = `Minute ${moment.utc(instant).format('HH:mm')}`;
            break;
        case enums.params.period.timeofday:            // 'Jan 1 Morning' 
            label = `${moment.utc(instant).format('MMM')} ${moment.utc(instant).format('D')} ${utils.capitalise(selectTimeOfDayEnum(instant))}`;
            break;
        case enums.params.period.day:                  // 'Mon Jan 1st'
            label = `${moment.utc(instant).format('ddd')} ${moment.utc(instant).format('MMM')} ${moment.utc(instant).format('Do')}`
            break;
        case enums.params.period.month:                // 'Mar 2019'
            label = `${moment.utc(instant).format('MMM')} ${year}`;
            break;
        case enums.params.period.quarter:              // 'Q1 2019'
            label = `${selectQuarterLabel(instant)} ${year}`;
            break;
        case enums.params.period.week:                 // 'Wk 27 2019'
            label = `Wk ${moment.utc(instant).isoWeek().toString().padStart(2, '0')} ${moment.utc(instant).isoWeekYear()}`;     // pad zers
            break;
        case enums.params.period.hour:                 // 'Hr 2100'
            label = `Hr ${moment.utc(instant).format('HH')}00`;
            break;
        case enums.params.period.year:                 // '2019'
            label = `${year}`;
            break;
        case enums.params.period.fiveyear:             // '5 Years 2014-2019'
            const FIVE_YEARS_IN_TOTAL = 4;

            // get the start of the five year period - as moment.js does not have a fiveyear concept 
            let normalisedInstant = periodEpoch(enums.params.period.fiveyear, instant, consts.period.datetimeISO.instant);
            year = moment.utc(normalisedInstant).format('YYYY');

            label = `5 Years ${year}-${moment.utc(normalisedInstant).add(FIVE_YEARS_IN_TOTAL, 'years').format('YYYY')}`;

            break;
        default:
            label = utils.capitalise(periodEnum);
            break;
    }
    return label;
}

module.exports = Period;
