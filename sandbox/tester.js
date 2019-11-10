//@ts-check
'use strict';

const utils = require('../src/environment/utils');
const consts = require('../src/host/constants');

const moment = require('moment');

const MILLISECOND_FORMAT = consts.period.datetimeISO.instant;                                    // the default format, YYYYMMDDTHHmmss.SSS

function test1(value) { 
    
    return '';
}
function test2(value) {
    
    return '';
    
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

// test... node sandbox/tester
console.log(`'' - ${blendEpoch('')}`); 
console.log(`'2017' - ${blendEpoch('2017')}`); 
console.log(`'201710' - ${blendEpoch('201710')}`); 
console.log(`'20171002' - ${blendEpoch('20171002')}`); 
console.log(`'20171002T14' - ${blendEpoch('20171002T14')}`); 
console.log(`'20171002T1437' - ${blendEpoch('20171002T1437')}`); 
console.log(`'20171002T143733' - ${blendEpoch('20171002T143733')}`); 
console.log(`'20171002T143733+0700' - ${blendEpoch('20171002T143733+0700')}`); 
console.log(`'20171002T143733.1011' - ${blendEpoch('20171002T143733.1011')}`);
console.log(`'20171002T143733.1011+0700' - ${blendEpoch('20171002T143733.1011+0700')}`);

//console.log(test2(''));
