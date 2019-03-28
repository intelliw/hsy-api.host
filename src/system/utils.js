//@ts-check
/**
 * PACKAGE: ./system/index.js
 * schemas and constants
 */

const enums = require('./enums');

module.exports.capitalise = (str) => {return str.charAt(0).toUpperCase() + str.slice(1)};       // capitalise first letter

// returns a min and max value for the average energy consumed in this period
module.exports.MOCK_periodMinMax = (period, dailyHigh, dailyLow) => {

    let minmax = { min: dailyHigh, max: dailyLow };
    let multiplier = 1;

    switch (period.value) {
        case enums.period.instant:
            multiplier = 0.0000000116;
            break;
        case enums.period.second:
            multiplier = 0.0000115741;
            break;
        case enums.period.minute:
            multiplier = 0.0006944444;
            break;
        case enums.period.hour:
            multiplier = 0.0416666667;
            break;
        case enums.period.timeofday:
            multiplier = 0.2500000000;
            break;
        case enums.period.week:
            multiplier = 7.0000000000;
            break;
        case enums.period.month:
            multiplier = 31.0000000000;
            break;
        case enums.period.quarter:
            multiplier = 124.0000000000;
            break;
        case enums.period.year:
            multiplier = 365.0000000000;
            break;
        case enums.period.fiveyear:
            multiplier = 1825.0000000000;
            break;
        case enums.period.day:
        default:
            multiplier = 1.000;
            break;
    }
    minmax.min = dailyLow * multiplier;
    minmax.max = dailyHigh * multiplier;

    return minmax;
}


// returns a space delimited list containing as many values as the duration
module.exports.MOCK_randomValues = (min, max, duration) => {
    
    const precision = 1000000;                                  // 3 decimals
    min = min * precision;                                      // adjust before dividing for decimal place
    max = max * precision;

    let p; let randomNum; let values;

    for (p = 1; p <= duration; p++) {
        randomNum = (Math.floor(Math.random() * max) + min) / precision;

        values = p == 1 ? '' : values + ' ';        // pad a space after the 1st iteration
        values = values + randomNum.toString();
    }

    return values;

}