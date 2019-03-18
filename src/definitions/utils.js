//@ts-check
/**
 * ./svc/util.js
 * 
 * tools and utilities
 */
const enums = require('./enums');


// returns a format string for UTC time corresponding to the specified period.   
module.exports.periodFormatUTC = (period) => {

    var format;
    switch (period) {
        case enums.period.instant:
            format = 'YYYYMMDDThhmmsssss';
            break;
        case enums.period.second:
            format = 'YYYYMMDDThhmmss';
            break;
        case enums.period.hour:                 // timofday formatted same as hour
        case enums.period.timeofday:
            format = 'YYYYMMDDThh';
            break;
        case enums.period.month:                // quarter formatted same as month
        case enums.period.quarter:
            format = 'YYYYMM';
            break;
        case enums.period.year:                 // year and fiveyear are the same
        case enums.period.fiveyear:
            format = 'YYYY';
            break;
        case enums.period.week:                 // week and dayt are the same
        case enums.period.day:
        default:                                // default is week 
            format = 'YYYYMMDD';
            break;
    }
    return format;
};


