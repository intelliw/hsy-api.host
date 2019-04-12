//@ts-check
/**
 * ./svc/constant.js
 * global constants
 */
const path = require('path');                   // this is a node package not the '../paths' applicaiton module
const enums = require('./enums');

// folder locations
module.exports.folders = {
    VIEWS: path.dirname(require.resolve('../views'))
};

// the starting hour of each timeofday 
module.exports.timeOfDayStart = {
    morning: '6',
    afternoon: '12',
    evening: '18',
    night: '0'
};

// the number of child periods in a period. 
module.exports.periodChildDuration = {
    secondinstant: '1000',                      // e.g there are 1000 milliseconds in a second
    minutesecond: '60',                         // 60 seconds in a minute
    hourminute: '60',
    timeofdayhour: '6',
    daytimeofday: '4',
    weekday: '7',                               // 7 days in a week
    // monthday is derived dynamically
    monthday: this.NONE,                        
    quartermonth: '3',                          // 3 months in a quarter
    yearquarter: '4',
    fiveyearyear: '5'
};

// space delimited labels to diisplay as headers for child periods. 
module.exports.periodChildDescription = {
    secondinstant: this.NONE,
    minutesecond: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60',
    hourminute: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60',
    timeofdayhour: { 'morning': '06 07 08 09 10 11', 'afternoon': '12 13 14 15 16 17', 'evening': '18 19 20 21 22 23', 'night': '00 01 02 03 04 05' },
    daytimeofday: 'Morning Afternoon Evening Night',
    weekday: 'Mon Tue Wed Thu Fri Sat Sun',
    // monthday is appended dynamically to the dates for Feb (the shortest month, for better performance)
    monthday: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28',                        
    quartermonth: { 'Q1': 'Jan Feb Mar', 'Q2': 'Apr May Jun', 'Q3': 'Jul Aug Sep', 'Q4': 'Oct Nov Dec' },
    yearquarter: 'Q1 Q2 Q3 Q4',
    fiveyearyear: this.NONE                     // fiveyearyear is derived dynamically
};

// parent periods
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
    fiveyear: this.NONE                         // fiveyear has no parent  
}

// child periods
module.exports.periodChild = {
    instant: this.NONE,                         // instant has no child
    second: enums.period.instant,               // to prevent perf issues with the itemdata for instant we should only return instants which have data ( do not return zero value instants)
    minute: enums.period.second,
    hour: enums.period.minute,
    timeofday: enums.period.hour,
    day: enums.period.timeofday,
    week: enums.period.day,
    month: enums.period.day,                    // we've decided to go with child of month as day as 4 weeks do not make a month
    quarter: enums.period.month,
    year: enums.period.quarter,
    fiveyear: enums.period.year
}

// returns a format string for UTC compresed datetime for use in links and identifiers
module.exports.periodDatetimeISO = {
    instant: 'YYYYMMDDTHHmmss.SSS',
    second: 'YYYYMMDDTHHmmss',
    minute: 'YYYYMMDDTHHmm',
    hour: 'YYYYMMDDTHHmm',
    timeofday: 'YYYYMMDDTHHmm',                 // timofday formatted same as hour
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


// system constants
module.exports.ACTIVE_VERSIONS = '0.1 0.2';
module.exports.CURRENT_VERSION = '0.2';
module.exports.DATE_FORMAT = 'YYYYMMDDTHHmmss.SSS±HHmm';
module.exports.NONE = global.undefined;
// parameter constants 
module.exports.DEFAULT_DURATION = '1';
module.exports.DEFAULT_SITE = '999';
module.exports.API_KEY_PARAM_NAME = 'api_key';
module.exports.API_HOST = 'api.endpoints.sundaya.cloud.goog';
// module.exports.API_HOST = 'localhost:8080';
module.exports.API_SCHEME = 'http';
