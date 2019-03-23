//@ts-check
/**
 * ./svc/constant.js
 * global constants
 */
let path = require('path');                     // this is a node package not the '../paths' applicaiton module
const enums = require('./enums');

// folder locations
module.exports.folders = {
    VIEWS: path.dirname(require.resolve('../responses'))
};

// mime types used in headers
module.exports.mimeTypes = {
    applicationJson : 'application/json',
    applicationCollectionJson : 'application/vnd.collection+json',
    textHtml : 'text/html',
    textPlain : 'text/plain'
};

// parameter constants 
module.exports.params = {
    DEFAULT_DURATION : '1',
    DEFAULT_SITE : '999'
};

// system constants
module.exports.sys = {
    ACTIVE_VERSIONS : 'v1.0 v1.1',
    HOST_NAME : 'api.endpoints.sundaya.cloud.goog',
    DATE_FORMAT : 'YYYYMMDDTHHmmss.SSS±HHmm',
}

// the starting hour of each timeofday 
module.exports.timeOfDayStart = {
    morning: '6',
    afternoon: '12',
    evening: '18',
    night: '0'
};

// the number of child periods in a period. 
module.exports.childDurations = {
    secondinstant: '1000',                  // e.g there are 1000 milliseconds in a second
    minutesecond: '60',                     // 60 seconds in a minute
    hourminute: '60',
    timeofdayhour: '6',
    daytimeofday: '4',
    weekday: '7',                           // 7 days in a week
    quartermonth: '3',                      // 3 months in a quarter
    yearquarter: '4',
    fiveyearyear: '5'
};

// parent periods
module.exports.parentPeriod = {
    instant: enums.period.second,
    second: enums.period.minute,
    minute: enums.period.hour,
    hour: enums.period.timeofday,
    timeofday: enums.period.day,
    day: enums.period.week,
    week: enums.period.month,
    month: enums.period.quarter,
    quarter: enums.period.year,
    year: enums.period.fiveyear,
    fiveyear: global.undefined                // fiveyear has no parent  
}

// child periods
module.exports.childPeriod = {
    instant: global.undefined,                // instant has no child
    second: enums.period.instant,
    minute: enums.period.second,
    hour: enums.period.minute,
    timeofday: enums.period.hour,
    day: enums.period.timeofday,
    week: enums.period.day,
    month: enums.period.day,                  // we've decided to go with child of month as day as 4 weeks do not make a month
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
