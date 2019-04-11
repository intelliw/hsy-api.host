//@ts-check
/**
 * PACKAGE: ./host/index.js
 * schemas and constants
 */

const enums = require('./enums');

module.exports.capitalise = (str) => { return str.charAt(0).toUpperCase() + str.slice(1) };       // capitalise first letter

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

/**
 * returns a number sequence (e.g. days of the month '01 02 ..' etc) in a delimited string with zero padding
 * howMany is the number of numbers to output including the startNum 
 * e.g. startNum = 1, howMany = 10, delimiter = " "
 *  ->  '01 02 03 04 05 06 07 08 09 10'
  */
module.exports.numberSequenceString = (startNum, howMany, delimiter) => {
    const ZERO = "0";
    
    let seqStr = ""; let zerosToPad; let digits; let num;
    
    let maxNum = Number(startNum) + (howMany - 1);
    let maxDigits = maxNum.toString().length;

    let i;
    for (i = startNum; i <= maxNum; i++) {

        num = i.toString();
        zerosToPad = maxDigits - num.length;
        seqStr += ZERO.repeat(zerosToPad) + num + (i <= maxNum - 1 ? delimiter : "");
    }

    return seqStr;

}

/**
 * searches the findIn array for the first occurrence of an item in the find array. 
 * The items in the find array need to be in order of preference. The first match wil be returned.
 * if there are no matches and defaultIfNotFound is true, the first item in the findIn array will be returned as the default. 
 */
module.exports.selectFirstMatch = (findInCVL, find, defaultIfNotFound) => {

    let selectedItem;

    if (findInCVL && find) {

        const EXITFOR = findInCVL.length;

        let n;
        for (n = 0; n < findInCVL.length; n++) {
            if (find.includes(findInCVL[n])) {                              // if the value matches    
                selectedItem = findInCVL[n];                                // set the found item 
                n = EXITFOR;                                                // exit the loop
            }
        }

        selectedItem = !selectedItem && defaultIfNotFound ? findInCVL[0] : selectedItem;        // if the item was not found set default to first item in findIn
    }
    return selectedItem;
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

    const DAY_DECIMAL_PLACES = 3;                                           // 3 decimals
    let minmax = { min: dailyHigh, max: dailyLow, precision: DAY_DECIMAL_PLACES };

    let multiplier = 1; let decimalPlaces = DAY_DECIMAL_PLACES;
    switch (period.value) {
        case enums.period.instant:
            multiplier = 0.0000000116;
            decimalPlaces = 12;
            break;
        case enums.period.second:
            multiplier = 0.0000115741;
            decimalPlaces = 9;
            break;
        case enums.period.minute:
            multiplier = 0.0006944444;
            decimalPlaces = 9;
            break;
        case enums.period.hour:
            multiplier = 0.0416666667;
            decimalPlaces = 6;
            break;
        case enums.period.timeofday:
            multiplier = 0.2500000000;
            decimalPlaces = 3;
            break;
        case enums.period.week:
            multiplier = 7.0000000000;
            decimalPlaces = 3;
            break;
        case enums.period.month:
            multiplier = 31.0000000000;
            decimalPlaces = 3;
            break;
        case enums.period.quarter:
            multiplier = 124.0000000000;
            decimalPlaces = 3;
            break;
        case enums.period.year:
            multiplier = 365.0000000000;
            decimalPlaces = 3;
            break;
        case enums.period.fiveyear:
            multiplier = 1825.0000000000;
            decimalPlaces = 3;
            break;
        case enums.period.day:
        default:
            multiplier = 1.000;
            decimalPlaces = 3;
            break;
    }
    minmax.min = dailyLow * multiplier;
    minmax.max = dailyHigh * multiplier;
    minmax.precision = decimalPlaces;

    return minmax;
}

// returns true at random. This was needed to limit the periods which are outputted fior 'instant' to simulate real-life data logging
module.exports.randomTrue = () => {

    let randomTrue; let randomnum;
    const max = 30;                                                     // the larger this number the more skips there will be  
    const random_match = 5;                                             // this can be any number less than MOCK_max

    randomnum = Number(this.randomFloat(1, max, 0));         // get a random integer between 1 and MOCK_max
    randomTrue = (randomnum == random_match) ? false : true;            // skip unless there is a match

    return randomTrue;                                                  // return whether to skip  

}