// returns a space delimited list containing as many values as the duration. if skip is true this will randsomly skips some to limit the output
function MOCK_createPeriodValues(min, max, duration) {

  const DECIMAL_PLACES = 3;                                  // 3 decimals
  const SPACE_DELIMITER = ' ';

  let MOCK_skip;

  // number of elements based on duration 
  let numelements = duration;

  // random number or array of space delimited random numbers if child
  let p; let randomNum; let values;

  for (p = 1; p <= numelements; p++) {

      // randomly skip if requested - needed to limit output to suimulate real-life data logging for isntant

      randomNum = this.randomFloat(min, max, DECIMAL_PLACES);          // get a random number

      values = p == 1 ? '' : values + SPACE_DELIMITER;                // pad a space after the 1st iteration
      values = values + randomNum.toString();
  }

  return values;

}



  // for each child of the containing collection - provide a single total for each energy type
  let periodMinMax = utils.MOCK_periodMinMax(childPeriod, dailyHigh, dailyLow);                // get an adjusted minmax for this period
  energyNames.forEach(energyName => {

    let periodValue = utils.MOCK_randomValue(periodMinMax.min, periodMinMax.max, childPeriod.duration)
    if (periodValue) {
      childData.add(energyName, periodValue);                                       // e.g. harvest  21.133882
    }
  });

  if (childData._elements.length > 0) {                                             // add the 
    dataWrapper.addNested(childPeriod.context, `${childPeriod.epoch}/${childPeriod.duration}`, childData);
  }


  // returns a space delimited list containing as many values as the duration. if skip is true this will randsomly skips some to limit the output
module.exports.MOCK_randomValue = (min, max, decimalPlaces) => {


    let randomNum = this.randomFloat(min, max, decimalPlaces);          // get a random number

    return randomNum.toString();

}
