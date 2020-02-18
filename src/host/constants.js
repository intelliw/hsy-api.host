//@ts-check
'use strict';
/**
 * ./svc/constant.js
 * global constants
 */
const path = require('path');                   // this is a node package not the '../paths' applicaiton module
const enums = require('../environment/enums');

const utils = require('../environment/utils');

// folder locations
module.exports.folders = {
    VIEWS: path.dirname(require.resolve('../views')),
    STATIC: path.dirname(require.resolve('../../static'))
};


// links to hypermedia resources
module.exports.links = {
    energyDocs: "https://docs.sundaya.monitored.equipment/docs/api.sundaya.monitored.equipment/0/c/Getting%20Started/API%20Overview/Energy%20API"
}

// constants for period algebra
module.exports.period = {

    /*  this is a lookup for child period ('c') and duration ('d')
        the lookup is parent => child 
            or parent+child => grandchild.
        all entries must be commutatively equivalent to an equivalent entry in descendentParent enum /lookup
        items prefixed with ALT refer to alternate childreb (some periods have alternate children)
    */
    ancestorChild: {
        second: { 'c': enums.params.period.instant, 'd': '1000' },
        secondinstant: this.NONE,

        minute: { 'c': enums.params.period.second, 'd': '60' },
        minutesecond: { 'c': enums.params.period.instant, 'd': '1000' },

        qtrhour: { 'c': enums.params.period.minute, 'd': '15' },
        qtrhourminute: { 'c': enums.params.period.second, 'd': '60' },

        hour: { 'c': enums.params.period.minute, 'd': '60' },
        hourminute: { 'c': enums.params.period.second, 'd': '60' },
        ALT_hour: { 'c': enums.params.period.qtrhour, 'd': '4' },
        hourqtrhour: { 'c': enums.params.period.minute, 'd': '15' },

        timeofday: { 'c': enums.params.period.hour, 'd': '6' },
        timeofdayhour: { 'c': enums.params.period.minute, 'd': '60' },

        day: { 'c': enums.params.period.hour, 'd': '24' },
        dayhour: { 'c': enums.params.period.minute, 'd': '60' },
        ALT_day: { 'c': enums.params.period.timeofday, 'd': '4' },
        daytimeofday: { 'c': enums.params.period.hour, 'd': '4' },

        week: { 'c': enums.params.period.day, 'd': '7' },
        weekday: { 'c': enums.params.period.timeofday, 'd': '4' },

        month: { 'c': enums.params.period.day, 'd': this.NONE },         // monthday is derived dynamically
        monthday: { 'c': enums.params.period.hour, 'd': '24' },                 // number of monthdays is derived dynamically
        ALT_month: { 'c': enums.params.period.week, 'd': '4' },
        monthweek: { 'c': enums.params.period.day, 'd': '7' },

        quarter: { 'c': enums.params.period.month, 'd': '3' },
        quartermonth: { 'c': enums.params.period.day, 'd': this.NONE },         // number of monthdays is derived dynamically

        year: { 'c': enums.params.period.month, 'd': '12' },
        yearmonth: { 'c': enums.params.period.day, 'd': this.NONE },            // number of monthdays is derived dynamically
        ALT_year: { 'c': enums.params.period.quarter, 'd': '4' },
        yearquarter: { 'c': enums.params.period.month, 'd': '3' },

        fiveyear: { 'c': enums.params.period.year, 'd': '5' },
        fiveyearyear: { 'c': enums.params.period.month, 'd': '4' }
    },

    /*  parent period lookup.  
        the lookup is child => parent 
            or grandchild-+-child => parent.
        all entries must be commutatively equivalent to an equivalent entry in ancestorChild enum /lookup
        items prefixed with ALT refer to alternate parents (some periods have alternate parents)
    */
    descendentParent: {
        instant: enums.params.period.second,
        instantsecond: enums.params.period.minute,

        second: enums.params.period.minute,
        secondminute: enums.params.period.hour,

        minute: enums.params.period.hour,
        minutehour: enums.params.period.timeofday,
        ALT_minutehour: enums.params.period.day,
        ALT_minute: enums.params.period.qtrhour,
        minuteqtrhour: enums.params.period.hour,

        qtrhour: enums.params.period.hour,
        qtrhourhour: enums.params.period.timeofday,

        hour: enums.params.period.day,
        hourday: enums.params.period.month,
        ALT_hourday: enums.params.period.week,
        ALT_hour: enums.params.period.timeofday,
        hourtimeofday: enums.params.period.day,

        timeofday: enums.params.period.day,
        timeofdayday: enums.params.period.week,

        day: enums.params.period.month,
        ALT_day: enums.params.period.week,
        dayweek: enums.params.period.month,

        week: enums.params.period.month,
        weekmonth: enums.params.period.quarter,

        month: enums.params.period.year,
        ALT_month: enums.params.period.quarter,
        monthquarter: enums.params.period.year,

        quarter: enums.params.period.year,
        quarteryear: enums.params.period.fiveyear,

        year: enums.params.period.fiveyear,

        fiveyear: this.NONE

    },

    // the lookup is parent-child e.g. weekday. returns space delimited labels to diisplay as headers for child or grandchild periods when presented in a parent context. 
    childDescription: {
        secondinstant: this.NONE,
        minutesecond: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60',
        hourminute: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60',
        hourqtrhour: 'One Two Three Four',
        qtrhourminute: { 'one': '00 01 02 03 04 05 06 07 08 09 10 11 12 13 14', 'two': '15 16 17 18 19 20 21 22 23 24 25 26 27 28 29', 'three': '30 31 32 33 34 35 36 37 38 39 40 41 42 43 44', 'four': '45 46 47 48 49 50 51 52 53 54 55 56 57 58 59' },
        timeofdayhour: { 'night': '00 01 02 03 04 05', 'morning': '06 07 08 09 10 11', 'afternoon': '12 13 14 15 16 17', 'evening': '18 19 20 21 22 23' },
        dayhour: '00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23',
        daytimeofday: 'Night Morning Afternoon Evening',
        weekday: 'Mon Tue Wed Thu Fri Sat Sun',
        monthday: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28',        // monthday is appended dynamically to these dates for Feb (the shortest month) for better performance
        monthweek: '01 02 03 04',
        quartermonth: { 'Q1': 'Jan Feb Mar', 'Q2': 'Apr May Jun', 'Q3': 'Jul Aug Sep', 'Q4': 'Oct Nov Dec' },
        yearmonth: this.NONE,                                                                                   // description is constructed in Period.parentChildDescription()
        yearquarter: 'Q1 Q2 Q3 Q4',
        fiveyearyear: this.NONE,
    },

    // the lookup is specially for child-grandchild lookups which are different to a lookup for the same periods in a parent-child lookup
    grandchildDescription: {
        quartermonth: '01 02 03'                    // a grandchild month could apply to any quarter so make these generic month numbers  
    },

    // returns a format string for UTC compresed datetime for use in links and identifiers
    datetimeISO: {
        instant: 'YYYYMMDDTHHmmss.SSSS',
        second: 'YYYYMMDDTHHmmss',
        minute: 'YYYYMMDDTHHmm',
        qtrhour: 'YYYYMMDDTHHmm',                   // same as minute
        hour: 'YYYYMMDDTHHmm',
        timeofday: 'YYYYMMDDTHHmm',                 // timeofday formatted same as hour
        day: 'YYYYMMDD',
        week: 'YYYYMMDD',
        month: 'YYYYMMDD',
        quarter: 'YYYYMMDD',
        year: 'YYYYMMDD',
        fiveyear: 'YYYYMMDD'
    },

    // returns a format string for uncompressed date time for use in display properties  
    datetimeGeneral: {
        instant: 'DD/MM/YY HHmmss.SSSS',
        second: 'DD/MM/YY HHmm:ss',
        minute: 'DD/MM/YY HH:mm',
        qtrhour: 'DD/MM/YY HH:mm',                   // same as minute
        hour: 'DD/MM/YY HH:mm',
        timeofday: 'DD/MM/YY HH:mm',                // timofday formatted same as hour
        day: 'DD/MM/YY',
        week: 'DD/MM/YY',
        month: 'DD/MM/YY',
        quarter: 'DD/MM/YY',
        year: 'DD/MM/YY',
        fiveyear: 'DD/MM/YY'
    },

    // returns max allowed durations for each period. each period cap is proportional to the large number of items in its collection
    maxDurationsAllowed: {
        instant: '1',                               // max allowed for time periods is 1 due to large number of items in each collection 
        second: '1',
        minute: '1',                                // 1 hr     - there are 60 items (seconds) per minute
        qtrhour: '8',                               // 2 days
        hour: '6',                                  // 6 hrs    - there are 60 items (minutes) per hour
        timeofday: '8',                             // 2 days   - there are 6 items (hours) per timeofday 
        day: '31',                                  // 1 months - there are 4 items (timeofdays) per day    
        week: '12',                                 // 3 months - there are 7 items (days) in a week
        month: '6',                                 // 6 months - there are 31 items (days) in a month.. so cap to 6 (2 quarters)
        quarter: '8',                               // 2 years  - there are 3 items (months) in a quarter
        year: '5',                                  // 5 years  - there are 4 items (quarters) in a year
        fiveyear: '5'                               // 5 years  - there are 5 items (years) in a fiveyear    
    },
    
    periodStart: {
        timeOfDay: {                               // the starting hour of each timeofday                                            
            morning: '6',
            afternoon: '12',
            evening: '18',
            night: '0'
        },
        qtrHour: {                                 // the starting minute of each quarter hour                                            
            one: '0',
            two: '15',
            three: '30',
            four: '45'
        }
    }

}

// constants for dates and timestamps
module.exports.dateTime = {
    bigqueryUtcTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSSZ',                 // "2019-02-09T16:00:17.0200+08:00"
    bigqueryZonelessTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSS',             // "2019-02-09T16:00:17.0200"          use this format to force bigquery to store local time without converting to utc          
}

// constants to define api parameters 
module.exports.params = {
    names: {
        apiKey: 'apikey',
        acceptType: 'accept',
        contentType: 'contentType'

    },
    defaults: {
        site: '999',
        duration: 1                                             // energy api duration parameter 
    }
}

// equipment status constants - for non-binary statuses based on a tuple of multiple bits e.g if the 2 'mppt.input' bits have a value tuple of '00' the statis is 'normal'
module.exports.equStatus = {
    BIT_LENGTH: 16,                                             // how many digits int he cell number e.g 02
    ENUM_PREFIX: 'tuple_',                                      // prefix used on consts.equStatus to support string lookup   
    mppt: {
        input: {                                                // bit 1,2              "input": "normal"
            tuple_00: 'normal',
            tuple_01: 'no-power',
            tuple_10: 'high-volt-input',
            tuple_11: 'input-volt-error'
        },
        load: {                                                 // bit 7,8              "load": "ok",     
            tuple_00: 'ok',
            tuple_01: 'overcurrent',
            tuple_10: 'short',
            tuple_11: 'not-applicable'
        },
        charging: {                                             // bit 10,11            "charging": "not-charging",         
            tuple_00: 'not-charging',
            tuple_01: 'float',
            tuple_10: 'boost',
            tuple_11: 'equalisation'
        }
    }
}

// system configuration constants
module.exports.system = {
    BODYPARSER_LIMIT_MB: 1,                                     // max mb for post messages 
    MONITORING_PRECISION: 4,                                    // decimal places for float values in monitoring dataset
    SERVICE_ID: 'api-host'                                      // or api_consumer for logging - resource: {  labels: { service_id:    
}

// system constants
module.exports.NONE = global.undefined;
