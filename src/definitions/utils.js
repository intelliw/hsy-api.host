//@ts-check
/**
 * ./svc/util.js
 * 
 * tools and utilities
 */
const enums = require('./enums');


// returns a format string for UTC time corresponding to the specified period.   
module.exports.periodFormatUTC = (period) => {

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
        case enums.period.week:                 // week and dayt are the same
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


