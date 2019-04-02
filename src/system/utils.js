//@ts-check
/**
 * PACKAGE: ./system/index.js
 * schemas and constants
 */

const enums = require('./enums');

module.exports.capitalise = (str) => {return str.charAt(0).toUpperCase() + str.slice(1)};       // capitalise first letter

// returns the key name of the first property with a matching value. Can be used to retrieve an enum key from its value
module.exports.keynameFromValue = (obj, value) => {
    
    const keyname = Object.keys(obj)[this.indexFromValue(obj, value)];
    return keyname;    

}

// returns the index of the first property with a matching value. Returns -1 if missing. 
module.exports.indexFromValue = (obj, value) => {

    const index = Object.values(obj).indexOf(value);
    return index;    

}
// returns true if a property with a matching value exists in the object. Can be used to check if a value exists in an enum
module.exports.valueExists = (obj, value) => {
    
    const MISSING = -1;

    const exists = this.indexFromValue(obj, value) != MISSING;     
    return exists;    

}

// returns a random number between min and max with decimal places based on precision 
module.exports.randomFloat = (min, max, decimalPlaces) => {
    
    const precision = 1 * Math.pow(10, decimalPlaces);                      // e.g. 3 decimals = 1000000
    min = min * precision;                                                  // adjust before dividing for decimal place
    max = max * precision;

    let random = (Math.floor(Math.random() * max) + min) / precision;       //generate a random number with the required precision
    let randomFixed = random.toFixed(decimalPlaces);                        // fix the decimal places including trailing zeros which may be missing in 'random'

    return randomFixed;

}

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


// returns a space delimited list containing as many values as the duration. if skip is true this will randsomly skips some to limit the output
module.exports.MOCK_randomValues = (min, max, duration, skip) => {
    
    const decimalPlaces = 3;                                  // 3 decimals
    const SPACE_DELIMITER = ' ';

    let MOCK_skip;

    // number of elements based on duration 
    let numelements = duration;

    // random number or array of space delimited random numbers if child
    let p; let randomNum; let values;

    for (p = 1; p <= numelements; p++) {
        
        // randomly skip if requested - needed to limit output to suimulate real-life data logging for isntant
        MOCK_skip = skip ? this.MOCK_randomSkip() : false;
        if (!MOCK_skip) {

            randomNum = this.randomFloat(min, max, decimalPlaces);          // get a random number

            values = p == 1 ? '' : values + SPACE_DELIMITER;                // pad a space after the 1st iteration
            values = values + randomNum.toString();
        }
    }
    
    return values;
    
}

// returns true at random. This is needed to limit the periods which are outputted fior 'instant' to simulate real-life data logging
module.exports.MOCK_randomSkip = () => {
    
    let MOCK_skip; let MOCK_randomnum; 
    const MOCK_max = 30;                                                   // the larger this nuymber the more skips there will be  
    const MOCK_match = 5;                                                  // this can be any number less than MOCK_max

    MOCK_randomnum = this.randomFloat(1, MOCK_max, 0).toFixed(0)           // get a random integer between 1 and MOCK_max
    MOCK_skip = (MOCK_randomnum == MOCK_match) ? false : true;             // skip unless there is a match

    return MOCK_skip;                                                      // return whether to skip  

}
