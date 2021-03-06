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
 * expects a date-time value in local or utc format. period.value is required (as a string) and must contain a valid date/time (moment.utc(value).isValid() == true)
 * checks to see if value is valid and sets default to current time if it is not.
 * if value is valid calls blendEpoch() to merge partial date-and time componets in value, with the current date and time
 * value is formatted according to the specified period (def.enum.period argument)
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
    * @param {*} reqPeriod      // enums.params.period             e.g. 'week' - stored as this.value
    * @param {*} epoch          // date-time 
    * @param {*} duration       // positive or negative integer
    */
    constructor(reqPeriod, epoch, duration = consts.params.defaults.duration) {

        // period, context
        super(THIS_PARAM_NAME, reqPeriod, enums.params.period.default, enums.params.period);    // e.g. reqPeriod' ='week';' 
        reqPeriod = this.value;                      // this.value was set to default period if reqPeriod was undefined

        this.context = reqPeriod;
        this.parent = consts.NONE;                   // getChild sets this after construction
        this.grandparent = consts.NONE;              // getChild sets this after construction

        // duration
        this.duration = Math.abs(duration);                                                     // duration could be a negative number - store the absolute value in this.duration as it will be applicable to the adjusted epoch returned for the negative duration, from periodEpoch() 

        // epoch and end millisecond timestamps                                                 // validates and normalises the epoch and end, for the supplied period and duration
        epoch = blendEpoch(epoch);                                                              // blend and normalise the epoch, if not valid the current date and time is returned
        epoch = periodEpoch(reqPeriod, epoch, MILLISECOND_FORMAT, duration);                    // normalise the epoch to the exact start of the period. If duration is negative the returned epoch will be adjusted by subtracting periods for -n durations 
        //..
        this.epochInstant = epoch;
        this.endInstant = periodEnd(reqPeriod, this.epochInstant, MILLISECOND_FORMAT, this.duration);   // period end - get the end date-time based on the epoch and duration 

        // epoch and end formatted timestamps
        this.epoch = datetimeFormatISO(this.epochInstant, reqPeriod);                           // format for the period  
        this.end = datetimeFormatISO(this.endInstant, reqPeriod);

        // hypermedia properties 
        this.rel = enums.linkRelations.self;                                                    // default is 'self' this is overwritten for parent, child, etc after construction
        this.prompt = periodPrompt(this.epochInstant, this.endInstant, reqPeriod, duration);

        this.title = periodTitle(this.epochInstant, this.endInstant, reqPeriod);                // "04/02/2019 - 10/02/2019";
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

    /* returns a parent object for this period. 
    *  alt is a boolean argument to request an alternate parent if defined in descendentParent
    */
    getParent(alt = false) {
        
        const ALT_PREFIX = 'ALT_';              // the prefix applied to periods with alternate parents in descendentParent constant list

        let parent = this.parent;
        let self = this.value;

        // select the parent period enum based on a descendent-parent lookop
        let parentEnum = consts.period.descendentParent[`${alt ? ALT_PREFIX : ''}${parent ? parent : ''}${self}`];

        if (parentEnum) {                                                                       // fiveyear has no p[arent]    
            //create the period and sets its relationship
            parent = new Period(parentEnum, this.epochInstant, consts.params.defaults.duration);
            parent.rel = enums.linkRelations.up;                                                // up is the rel for the parent
        }

        return parent;
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

    /* returns the child of this period including the duration, which is the number of child periods in the period 
    *  alt is a boolean argument to request an alternate child - if defined in ancestorChild
    */ 
    getChild(alt = false) {

        const ALT_PREFIX = 'ALT_';                                                          // the prefix applied to periods with alternate children in ancestorChild constant list
        const ALT_DURATION = 1;                                                             // default duration for alt children is 1

        let child;
        let duration;

        // get ancestry
        let parent = this.value;
        let grandparent = this.parent;                                                      // grandparent is presents only if a child creates a child

        // lookup child period
        let childMap = consts.period.ancestorChild[`${alt ? ALT_PREFIX : ''}${grandparent ? grandparent : ''}${parent}`];
        let childEnum = childMap ? childMap.c : consts.NONE;

        if (childEnum) {                                                                    // e.g. instant has no child    

            duration = alt ? ALT_DURATION : childDuration(this, childEnum, childMap.d);     // default duration is childMap.d

            //set child props and relationship
            child = new Period(childMap.c, this.epochInstant, duration);                    // construct child with a duration  
            child.parent = parent;
            child.grandparent = grandparent;
            child.context = `${alt ? '' : parent + '.'}${childEnum}`                        // context is parent to this (i.e child)  e.g. 'week.day' 
            child.rel = alt ? enums.linkRelations.down : enums.linkRelations.collection;    // rel is 'down' if alt child                                   // collection is the rel for a child or grandchild
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

/* blends the provided epoch with the current date and time, 
    and returns a normalised epoch string in UTC millisecond format.
    The returned epoch will contain date-and-time-parts from the request epoch argument, 
    blended (on the right) with date-and-time-parts from the current date and time 
    e.g:
        ''                              - 20191110T055113.2690
        '2017'                          - 20171110T055113.2840
        '201710'                        - 20171010T055113.2890
        '20171002'                      - 20171002T055113.2900
        '20171002T14'                   - 20171002T145113.2910
        '20171002T1437'                 - 20171002T143713.2930
        '20171002T143733'               - 20171002T143733.3180
        '20171002T143733+0700'          - 20171002T073733.0000
        '20171002T143733.1011'          - 20171002T143733.1010
        '20171002T143733.1011+0700'     - 20171002T073733.1010
    If the provided epoch is not valid the current date and time is returned
*/
function blendEpoch(epoch) {

    const MIN_YEAR_LENGTH = 4;                                                          // year must be 4 characters            (e.g 2019)
    const MIN_WITH_MONTH_LENGTH = 6;                                                    // with month, >=6 and <=7 characters   (e.g 201911 or 2019-11)
    const MIN_WITH_DAY_LENGTH = 8;                                                      // with date, >=8 and <=10 characters   (e.g 20191108 or 2019-11-08)

    const MIN_HOURS_LENGTH = 2;                                                         // hour must be 2 characters            (e.g 12)
    const MIN_WITH_MINUTES_LENGTH = 4;                                                  // with minutes, >=4 and <=5 characters (e.g 1200 or 12:00)
    const MIN_WITH_SECONDS_LENGTH = 6;                                                  // with seconds, >=6 and <=8 characters (e.g 120050 or 12:00:50)
    const MIN_WITH_MILLISECONDS_LENGTH = 10;                                            // with milliseconds, >=10              (e.g 120050.001 or 120050.0001 or 12:00:50.001...)

    const ISO8601_TIME_DELIMITER = 'T';

    // start with the current date and time        
    let normativeEpoch = moment.utc().format(MILLISECOND_FORMAT);                       // start with the current date and time and blend requ epoch below

    // first check if there is a valid date of any sort                             
    if (moment.utc(epoch, MILLISECOND_FORMAT).isValid()) {                              // returns true for partial dates and times including 2019, 201911, 20191108, 20191108T14, 20191108T1437, 20191108T143733, 20191108T143733.0001 and 20171002T143733+0700 etc

        // convert to utc string
        epoch = /[+-]/.test(epoch) ? moment.utc(epoch).format(MILLISECOND_FORMAT) : epoch;      // if there is a +/- offset convert the epoch string to utc

        // separate date and time
        let date = epoch.indexOf(ISO8601_TIME_DELIMITER) >= 0 ?
            epoch.substring(0, epoch.indexOf(ISO8601_TIME_DELIMITER) + 1) :             // get the date part
            epoch;
        let time = epoch.indexOf(ISO8601_TIME_DELIMITER) >= 0 ?
            epoch.substring(epoch.indexOf(ISO8601_TIME_DELIMITER) + 1) :                // get the time part 
            consts.NONE;

        // normalise the date 
        let year = date.length >= MIN_YEAR_LENGTH ? moment.utc(epoch, MILLISECOND_FORMAT).year() : moment.utc(normativeEpoch, MILLISECOND_FORMAT).year();
        let month = date.length >= MIN_WITH_MONTH_LENGTH ? moment.utc(epoch, MILLISECOND_FORMAT).month() : moment.utc(normativeEpoch, MILLISECOND_FORMAT).month();
        let day = date.length >= MIN_WITH_DAY_LENGTH ? moment.utc(epoch, MILLISECOND_FORMAT).date() : moment.utc(normativeEpoch, MILLISECOND_FORMAT).date();
        //..
        normativeEpoch = moment.utc(normativeEpoch).year(year).month(month).date(day).format(MILLISECOND_FORMAT)

        // normalise the time 
        if (time) {

            let hour = time.length >= MIN_HOURS_LENGTH ? moment.utc(epoch, MILLISECOND_FORMAT).hour() : moment.utc(normativeEpoch, MILLISECOND_FORMAT).hour();
            let minute = time.length >= MIN_WITH_MINUTES_LENGTH ? moment.utc(epoch, MILLISECOND_FORMAT).minute() : moment.utc(normativeEpoch, MILLISECOND_FORMAT).minute();
            let second = time.length >= MIN_WITH_SECONDS_LENGTH ? moment.utc(epoch, MILLISECOND_FORMAT).second() : moment.utc(normativeEpoch, MILLISECOND_FORMAT).second();
            let millisecond = time.length >= MIN_WITH_MILLISECONDS_LENGTH ? moment.utc(epoch, MILLISECOND_FORMAT).millisecond() : moment.utc(normativeEpoch, MILLISECOND_FORMAT).millisecond();
            //..
            normativeEpoch = moment.utc(normativeEpoch).hour(hour).minute(minute).second(second).millisecond(millisecond).format(MILLISECOND_FORMAT)

        }

    }
    return normativeEpoch;
}

// returns an epoch adjusted to the start of the period, and adjusted by subtracting the number of periods if duration is negative  
function periodEpoch(periodEnum, epoch, format, duration) {

    // if duration is negative, rewind epoch by a number of periods corresponding to duration 
    let periodsToSubtract = Math.sign(duration) < 0 ? Math.abs(duration) : 0;                    // subtract zero periods if duration is positive              
    
    // set the epoch and if needed adjust for negative duration 
    switch (periodEnum) {

        // epoch format YYYYMMDDTHHmmss.SSS -------------------------------              
        case enums.params.period.instant:

            epoch = moment.utc(epoch).subtract(periodsToSubtract, 'milliseconds').format(format);   // no adjustment - return milliseconds epoch (format YYYYMMDDTHHmmss.SSS)  
            break;

        case enums.params.period.qtrhour:                                                           // adjust to the start of the last 15mt block in the hour
            const QTRHR_DURATION_MINUTES = consts.period.periodDuration.qtrhourminute;              // == 15 (minutes)             ;                                                      // minutes in a quarter hour
            
            let min = periodRoundDown(epoch, enums.params.period.minute, QTRHR_DURATION_MINUTES);   // get rounded down minute -  0,15,30,or 45  - get the starting minute for the quarter hour     
            epoch = moment.utc(epoch)
                .set(enums.params.period.minute, min)
                .startOf(enums.params.period.minute)
                .format(format);

            periodsToSubtract = Math.sign(duration) < 0 ? Math.abs(duration) * QTRHR_DURATION_MINUTES : 0;    // subtract zero periods if duration is positive
            epoch = moment.utc(epoch).subtract(periodsToSubtract, 'minutes').startOf('minute').format(format);
            break;

        case enums.params.period.timeofday:                                                         // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   
            const TIMEOFDAY_DURATION_HRS = consts.period.periodDuration.timeofdayhour;              // == 6  (hours)

            let hr = periodRoundDown(epoch, enums.params.period.hour, TIMEOFDAY_DURATION_HRS);      // get rounded down hour to 0,6,12,or 18 - the starting hour for the timeofday 
            epoch = moment.utc(epoch)
                .set(enums.params.period.hour, hr)
                .startOf(enums.params.period.hour)
                .format(format);
            
            periodsToSubtract = Math.sign(duration) < 0 ? Math.abs(duration) * TIMEOFDAY_DURATION_HRS : 0;    // subtract zero periods if duration is positive              
            epoch = moment.utc(epoch).subtract(periodsToSubtract, 'hours').startOf('hour').format(format);
            break;

        // epoch format YYYYMMDD -----------------------------------------
        case enums.params.period.week:                                                              // adjust to start of the week

            epoch = moment.utc(epoch).subtract(periodsToSubtract, 'weeks').startOf('isoWeek').format(format);      // adjust to monday (iso week starts on monday) 
            break;

        case enums.params.period.fiveyear:                                                          // adjust to start of last 5 year block (2010, 2015, 2020 etc.)
            const FIVEYEAR_DURATION_YRS = consts.period.periodDuration.fivceyearyear;               // == 5 (years)

            let fiveyr = periodRoundDown(epoch, enums.params.period.year, FIVEYEAR_DURATION_YRS);      // get rounded down year to nearest 5 year epoch - 2010,2015 etc
            epoch = moment.utc(epoch)
                .set(enums.params.period.year, fiveyr)
                .startOf(enums.params.period.year)
                .format(format);
            
            periodsToSubtract = Math.sign(duration) < 0 ? Math.abs(duration) * FIVEYEAR_DURATION_YRS : 0;    // subtract durations for 5yr                         
            epoch = moment.utc(epoch).subtract(periodsToSubtract, 'years').startOf('year').format(format);
            break;

        // periods with a clear start
        case enums.params.period.hour:
        case enums.params.period.minute:
        case enums.params.period.second:
        case enums.params.period.day:
        case enums.params.period.month:
        case enums.params.period.quarter:
        case enums.params.period.year:

            epoch = moment.utc(epoch).subtract(periodsToSubtract, `${periodEnum}s`).startOf(periodEnum).format(format);  // get the start of the period and subtract if durations are negative
            break;
    }

    return epoch;
}

// returns the end of the period based on its epoch and duration 
function periodEnd(periodEnum, epoch, format, duration) {

    let periodEnd;
    let periodsToAdd = (Math.abs(duration) - 1);                                                      // add these periods to the period to get the end of the duration which starts at epoch

    switch (periodEnum) {

        case enums.params.period.instant:
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'milliseconds').format(format);
            break;

        case enums.params.period.qtrhour:                                                               // adjust to the start of the last 15mt block in the hour
            const QTRHR_DURATION_MINUTES = 15;                                                      // minutes

            periodsToAdd = (Math.abs(duration) * QTRHR_DURATION_MINUTES) - 1;                           // -1 to make endOf the last minute 
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'minutes').endOf('minute').format(format);
            break;

        case enums.params.period.timeofday:                                                             // adjust to the start of the last 6hr block in the day (morning=6, afternoon=12, evening-18, night=00)   
            const TIMEOFDAY_DURATION_HRS = 6;                                                           // hours

            periodsToAdd = (Math.abs(duration) * TIMEOFDAY_DURATION_HRS) - 1;                           // -1 to make endOf the last hour 
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'hours').endOf('hour').format(format);
            break;

        case enums.params.period.week:
            periodEnd = moment.utc(epoch).add(periodsToAdd, 'weeks').endOf('isoWeek').format(format);   // has to be isoWeek
            break;

        case enums.params.period.fiveyear:                                                              // add 5 years to epoch
            const FIVEYEAR_DURATION_YRS = 5;                                                            // years

            periodsToAdd = (Math.abs(duration) * FIVEYEAR_DURATION_YRS) - 1;                            // add at least one for 5yr to get to the endOf its period
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

/* returns the rounded down period component of the instant
    ..to the nearest start of a block period -  such as a quarter hour (defined by its duration == 15 minutes)
 * for example the period in an instant can be rounded down as follows 
 *  31/03/2020 12:14.59.9990 rounded down to the nearest quarter hour (15 minutes) => returns 15 (minute, =12:15)             (31/03/2020 12:15.59.9990)
 *  31/03/2020 12:14.59.9990 rounded down to the nearest timeofday (6 hours) => returns 12       (hour, =12:00-afternoon)    (31/03/2020 12:12.59.9990)
 *  31/03/2011 12:14.59.9990 rounded down to the nearest 5years (5 years) => returns 2010 (year, 31/03/2010 12:14.59.9990
 *
 *  period is a string, can be any of the momentjs periods
*/
function periodRoundDown (instant, periodEnum, duration) {

    let p = moment.utc(instant).get(periodEnum);                                                        // get the perioid component e.g.  
    p = p - (p % duration);
    
    return p;

}

// returns the total number of days between epochInstant and endInstant instants 
function periodDays(period) {
    
    const ONE_MILLISECOND = 1; 
    
    let endInstantInclusive = moment.utc(period.endInstant).add(ONE_MILLISECOND, 'ms');     // add one millisecond to include the last day
    
    let duration = endInstantInclusive.diff(moment.utc(period.epochInstant), 'days')
    
    return duration;

}

// returns the child duration (as a string) based on the parent epochInstant and endInstant  
function childDuration(parentObj, childEnum, defaultDuration) {

    let duration = 0;
    
    // get ancestry
    let parentEnum = parentObj.value;
    let grandparent = parentObj.parent;                                                                         // grandparent is presents only if a child creates a child
    
    // duration - if monthday get the number of days for the month
    if (parentEnum == enums.params.period.month && childEnum == enums.params.period.day) {
        duration = moment.utc(parentObj.epochInstant).daysInMonth().toString();                                 // get the number of days in the current month

    // in all other cases use the childMap default (from ancestorChild constant)
    } else {
        duration = defaultDuration;
    }

    // if there is a grandchild - calculate total child periods between parent epochInstant and endInstant      // e.g 28 if perent (week.day) is 7 and child (day.timeofday) is 4 
    if (grandparent) {

        // if child is day then use moment.js to calculate number of days in parent 
        if (childEnum == enums.params.period.day) {
            duration = periodDays(parentObj);

        // in all other cases multiply the child duration by the parent duration (e.g. 4 timofdays in 3 days == 12 timeofdays) 
        } else {

            duration = parseInt(parentObj.duration) * parseInt(duration);
        }
    }

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

            case 'secondinstant':
                break;                                                                  // not supported

            case 'minutesecond', 'hourqtrhour', 'hourminute' :
                break;                                                                  // literals from childDescription in constants.js

            case 'qtrhourminute':                                                       // '{ 'one': '00 01 ..', 'two': '15 16 ... etc
                
                let min = moment.utc(periodObj.epochInstant).get(enums.params.period.minute); // get the start minute
                
                let qhLbl = utils.keynameFromValue(                                     // get the key using the start minute as the value
                        consts.period.periodStart.qtrHour, 
                        min.toString());      //  enums.qtrHour.one     

                descr = descr[qhLbl];                                                   //  extract subvalue from label e.g. '06 07 08 09 10 11'
                break;

            
            case 'timeofdayhour':                   // timeofdayhour                    // '{ 'morning': '06 07 08 09 10 11', 'afternoon': '12 13 ... 
                let hr = periodRoundDown(epochInstant, enums.params.period.hour, consts.period.periodDuration.timeofdayhour);       // get the rounded down hour for this instant's timeofday
                
                let todLbl = utils.keynameFromValue(                                     // get the key using the start hour as the value
                    consts.period.periodStart.timeOfDay, 
                    hr.toString());      //  enums.qtrHour.one     

                descr = descr[todLbl];                                                  //  extract subvalue from label e.g. '06 07 08 09 10 11'
                break;

            case 'dayhour', 'daytimeofday', 'weekday':
                break;                                                                  // literals from childDescription in constants.js

            case 'monthday':                                                            // monthday

                const DEFAULT_START = 1;
                const MAXDAYS_PER_MONTH = 31;

                // get number of days in the month - excepot if grandparent is 'quarter' ..monthday duration should default to  31 days  
                const isGrandparentQuarter = periodObj.grandparent == enums.params.period.quarter;                      // check if grandparent is quarter as monthday does not apply in this case
                let duration = isGrandparentQuarter ? MAXDAYS_PER_MONTH : moment.utc(epochInstant).daysInMonth();       // get the days for this month (if grandparent is quarter deffault to 31)

                // create the description string
                let start = descr ? (descr.split(SPACE_DELIMITER).length) + 1 : DEFAULT_START; // get the days in the constant - this should be 28 - start at 29
                let howMany = (duration - start) + 1;

                descr = utils.createSequence(start, howMany, SPACE_DELIMITER, descr);

                break;

            case 'monthweek':
                break;                                                                  // literals from childDescription in constants.js

            case 'quartermonth':                    // quartermonth                     // { 'Q1': 'Jan Feb Mar', 'Q2': 'Apr May ...

                if (periodObj.grandparent) {                                            // if this is a child-grandchild lookup
                    descr =  consts.period.grandchildDescription[`${parent}${self}`];   // a grandchild month could apply to any quarter (e.g. '01, 02, 03')
                } else {                                                                // if this is a parent-child lookup 
                    let qtrLbl = selectQuarterLabel(epochInstant);                      //  Q1                    
                    descr = descr[qtrLbl];                                              //  extract subvalue from label e.g. 'Jan Feb Mar'
                }

                break;

            case 'yearmonth':
                descr = utils.arrayToString(moment.monthsShort(), " ");                 // e;g; "Jan", "Feb", "Mar..
                break;                                                                  
                
            case 'yearquarter':
                break;                                                                  // literals from childDescription in constants.js

            case 'fiveyearyear':                    // fiveyearyear

                let year = moment.utc(epochInstant).format('YYYY');
                descr = utils.createSequence(year, 5, SPACE_DELIMITER);

                break;

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
function periodPrompt(epoch, end, periodEnum, duration) {

    let epochPromptStr = datetimePromptStr(epoch, periodEnum);
    let endPromptStr = datetimePromptStr(end, periodEnum);

    // suppress end period for week and qtrhr
    let prompt = (epochPromptStr == endPromptStr) 
        || (periodEnum == enums.params.period.week && duration == 1)
        || (periodEnum == enums.params.period.qtrhour && duration == 1)
        ? `${epochPromptStr}` : `${epochPromptStr} - ${endPromptStr}`;

    return prompt;                                                                          // return formatted title

};

// select the quarter label (eg 'Q1' for the year of the epoch
function selectQuarterLabel(epoch) {

    const QUARTER_PREFIX = 'Q';

    let qtrNum = moment.utc(epoch).quarter();
    let qtrLbl = `${QUARTER_PREFIX}${qtrNum}`;          // Q1

    return qtrLbl;
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

        case enums.params.period.instant:              // '090623.554'  ..Instant 
            label = `${moment.utc(instant).format('HH:mm:ss.SSS')}`;
            break;
        case enums.params.period.second:               // '0906:24' ..Second 
            label = `${moment.utc(instant).format('HH:mm:ss')}`;
            break;
        case enums.params.period.minute:               // '09:06'  ..Minute 
            label = `${moment.utc(instant).format('HH:mm')}`;
            break;
        case enums.params.period.qtrhour:               // '15 mins 09:15'  ..Quarter Hr 
            label = `15 mins ${moment.utc(instant).format('HH:mm')}`;
            break;
        case enums.params.period.hour:                 // '2100 hrs'
            label = `${moment.utc(instant).format('HH')}00 hrs`;
            break;
        case enums.params.period.timeofday:            // 'Jan 1 Morning' 
            let hr = periodRoundDown(instant, enums.params.period.hour, consts.period.periodDuration.timeofdayhour);        // get the rounded down hour for this instant's timeofday   
            let todLbl = utils.keynameFromValue(consts.period.periodStart.timeOfDay, hr.toString());                        //  enums.qtrHour.one     
            label = `${moment.utc(instant).format('MMM')} ${moment.utc(instant).format('D')} ${utils.capitalise(todLbl)}`;
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
        case enums.params.period.week:                 // 'Week 02/02/20'
            label = `Week ${moment.utc(instant).format('DD-MM-YYYY')}`;     
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
