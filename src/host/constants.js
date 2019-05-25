//@ts-check
/**
 * ./svc/constant.js
 * global constants
 */
const path = require('path');                   // this is a node package not the '../paths' applicaiton module
const enums = require('./enums');

// folder locations
module.exports.folders = {
    VIEWS: path.dirname(require.resolve('../views')),
    STATIC: path.dirname(require.resolve('../../static'))
};

// the starting hour of each timeofday 
module.exports.timeOfDayStart = {
    morning: '6',
    afternoon: '12',
    evening: '18',
    night: '0'
};

// child period and duration lookup.  the lookup is parent => child or parent-+-child => grandchild. The fields are c: for child and d: for duration
module.exports.ancestorChild = {
    second: { 'c': enums.period.instant, 'd': '1000' },
    minute: { 'c': enums.period.second, 'd': '60' },
    hour: { 'c': enums.period.minute, 'd': '60' },
    timeofday: { 'c': enums.period.hour, 'd': '6' },
    day: { 'c': enums.period.hour, 'd': '24' },
    week: { 'c': enums.period.day, 'd': '7' },
    // monthday is derived dynamically
    month: { 'c': enums.period.day, 'd': this.NONE },
    quarter: { 'c': enums.period.month, 'd': '3' },
    year: { 'c': enums.period.quarter, 'd': '4' },
    fiveyear: { 'c': enums.period.year, 'd': '5' },
    minutesecond: { 'c': enums.period.instant, 'd': '1000' },
    hourminute: { 'c': enums.period.second, 'd': '60' },
    timeofdayhour: { 'c': enums.period.minute, 'd': '60' },
    dayhour: { 'c': enums.period.minute, 'd': '60' },
    weekday: { 'c': enums.period.timeofday, 'd': '4' },
    monthday: { 'c': enums.period.hour, 'd': '24' },
    // monthday is derived dynamically
    quartermonth: { 'c': enums.period.day, 'd': this.NONE },
    yearquarter: { 'c': enums.period.month, 'd': '3' },
    fiveyearyear: { 'c': enums.period.quarter, 'd': '4' }
}

// parent period lookup.  the lookup is child => parent or grandchild-+-child => grandparent
module.exports.descendentParent = {
    instant: enums.period.second,
    second: enums.period.minute,
    minute: enums.period.hour,
    hour: enums.period.day,
    day: enums.period.month,
    week: enums.period.month,
    month: enums.period.quarter,
    quarter: enums.period.year,
    year: enums.period.fiveyear,
    instantsecond: enums.period.minute,
    secondminute: enums.period.hour,
    minutehour: enums.period.day,
    timeofdayday: enums.period.week,
    hourday: enums.period.month,
    daymonth: enums.period.quarter,
    weekmonth: enums.period.year,
    monthquarter: enums.period.year,
    quarteryear: enums.period.fiveyear
}

// the lookup is parent-child e.g. weekday. returns space delimited labels to diisplay as headers for child or grandchild periods when presented in a parent context. 
module.exports.childDescription = {
    secondinstant: this.NONE,
    minutesecond: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60',
    hourminute: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60',
    timeofdayhour: { 'night': '00 01 02 03 04 05', 'morning': '06 07 08 09 10 11', 'afternoon': '12 13 14 15 16 17', 'evening': '18 19 20 21 22 23' },
    dayhour: '00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23',
    daytimeofday: 'Night Morning Afternoon Evening',
    weekday: 'Mon Tue Wed Thu Fri Sat Sun',
    // monthday is appended dynamically to the dates for Feb (the shortest month) for better performance
    monthday: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28',
    quartermonth: { 'Q1': 'Jan Feb Mar', 'Q2': 'Apr May Jun', 'Q3': 'Jul Aug Sep', 'Q4': 'Oct Nov Dec' },
    yearquarter: 'Q1 Q2 Q3 Q4',
    fiveyearyear: this.NONE,
};

// the number of child or grandchild periods in a period. 
module.exports.periodChildDuration = {
    secondinstant: '1000',                      // e.g there are 1000 milliseconds in a second
    minutesecond: '60',                         // 60 seconds in a minute
    hourminute: '60',
    timeofdayhour: '6',
    daytimeofday: '4',
    dayhour: '24',
    weekday: '7',                               // 7 days in a week
    // monthday is derived dynamically
    monthday: this.NONE,
    quartermonth: '3',                          // 3 months in a quarter
    yearquarter: '4',
    fiveyearyear: '5',

    // Grandchild... 
    minutesecondinstant: '1000',
    hourminutesecond: '60',
    timeofdayhourminute: '60',
    dayhourminute: '60',
    weekdaytimeofday: '4',
    monthdayhour: '24',
    // monthday is derived dynamically
    quartermonthday: this.NONE,
    yearquartermonth: '3',
    fiveyearyearquarter: '4'

};



// parent periods.  the lookup is child => parent or grandchild-+-child => grandparent
module.exports.periodParent = {
    instant: enums.period.second,
    second: enums.period.minute,
    minute: enums.period.hour,
    hour: enums.period.timeofday,
    timeofday: enums.period.day,
    day: enums.period.week,                     // choose week even though day has two parents (month and week)
    week: enums.period.month,
    month: enums.period.quarter,
    quarter: enums.period.year,
    year: enums.period.fiveyear,
    fiveyear: this.NONE,                         // fiveyear has no parent  
    //
    instantsecond: enums.period.minute,
    secondminute: enums.period.hour,
    minutehour: enums.period.timeofday,
    hourtimeofday: enums.period.day,
    timeofdayday: enums.period.week,
    dayweek: enums.period.month,
    weekmonth: enums.period.quarter,
    monthquarter: enums.period.year,
    quarteryear: enums.period.fiveyear,
    yearfiveyear: this.NONE,                     // fiveyear has no parent  
}

// child periods
module.exports.periodChild = {
    instant: this.NONE,                         // instant has no child
    second: enums.period.instant,               // to prevent perf issues with the itemdata for instant we should only return instants which have data ( do not return zero value instants)
    minute: enums.period.second,
    hour: enums.period.minute,
    timeofday: enums.period.hour,
    day: enums.period.hour,
    week: enums.period.day,
    month: enums.period.day,                    // we've decided to go with child of month as day as 4 weeks do not make a month
    quarter: enums.period.month,
    year: enums.period.quarter,
    fiveyear: enums.period.year
}

// grandchild periods 
module.exports.periodGrandchild = {
    instant: this.NONE,                         // instant has no grandchild
    second: this.NONE,                          //second has no grandchild         
    minute: enums.period.instant,
    hour: enums.period.second,
    timeofday: enums.period.minute,
    day: enums.period.minute,
    week: enums.period.timeofday,
    month: enums.period.hour,                    // we've decided to go with child of month as day as 4 weeks do not make a month
    quarter: enums.period.day,
    year: enums.period.month,
    fiveyear: enums.period.quarter
}

// returns a format string for UTC compresed datetime for use in links and identifiers
module.exports.periodDatetimeISO = {
    instant: 'YYYYMMDDTHHmmss.SSS',
    second: 'YYYYMMDDTHHmmss',
    minute: 'YYYYMMDDTHHmm',
    hour: 'YYYYMMDDTHHmm',
    timeofday: 'YYYYMMDDTHHmm',                 // timeofday formatted same as hour
    day: 'YYYYMMDD',
    week: 'YYYYMMDD',
    month: 'YYYYMMDD',
    quarter: 'YYYYMMDD',
    year: 'YYYYMMDD',
    fiveyear: 'YYYYMMDD'
}

// returns a format string for uncompressed date time for use in display properties  
module.exports.periodDatetimeGeneral = {
    instant: 'DD/MM/YY HHmmss.SSS',
    second: 'DD/MM/YY HHmm:ss',
    minute: 'DD/MM/YY HH:mm',
    hour: 'DD/MM/YY HH:mm',
    timeofday: 'DD/MM/YY HH:mm',                // timofday formatted same as hour
    day: 'DD/MM/YY',
    week: 'DD/MM/YY',
    month: 'DD/MM/YY',
    quarter: 'DD/MM/YY',
    year: 'DD/MM/YY',
    fiveyear: 'DD/MM/YY'
}

// returns max allowed durations for each period. each period cap is proportional to the large number of items in its collection
module.exports.periodMaxDurationsAllowed = {
    instant: '1',                                           // max allowed for time periods is 1 due to large number of items in each collection 
    second: '1',
    minute: '1',
    hour: '1',
    timeofday: '8',                                         // max allowed for time-of-day is 8 (2 days)  
    day: '31',                                              // only 4 items per day    
    week: '8',
    month: '3',                                             // there are 31 items in a month.. so cap to 3 (1 quarter)
    quarter: '8',
    year: '5',
    fiveyear: '5'
}

// system constants
module.exports.ACTIVE_VERSIONS = '0.2 0.3';
module.exports.CURRENT_VERSION = '0.3';
module.exports.DATE_FORMAT = 'YYYYMMDDTHHmmss.SSS±HHmm';
module.exports.NONE = global.undefined;
// parameter constants 
module.exports.DEFAULT_SITE = '999';
module.exports.DEFAULT_DURATION = '1';
module.exports.API_KEY_PARAM_NAME = 'api_key';              // header param, must be lower case
module.exports.ACCEPT_TYPE_PARAM_NAME = 'accept';
// module.exports.API_HOST = 'api.endpoints.sundaya.cloud.goog';
module.exports.API_HOST = 'localhost:8080';
module.exports.API_SCHEME = 'http';
