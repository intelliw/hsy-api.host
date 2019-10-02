//@ts-check
'use strict';
/**
 * ./svc/constant.js
 * global constants
 */
const path = require('path');                   // this is a node package not the '../paths' applicaiton module
const enums = require('./enums');
const utils = require('./utils');

const PRODUCER_CLIENTID = `producer.${utils.randomIntegerString(1,9999)}`

// folder locations
module.exports.folders = {
    VIEWS: path.dirname(require.resolve('../views')),
    STATIC: path.dirname(require.resolve('../../static'))
};

// the starting hour of each timeofday 
module.exports.timeOfDayStart = {
    morning: '6',
    afternoon: '12',
    evening: '18',
    night: '0'
};

// constants for period algebra
module.exports.period = {

    /* child period ('c') and duration ('d') lookup.  the lookup is parent => child or parent-+-child => grandchild. The fields are c: for child and d: for duration
    this lookup needs to be commutatively equivalent to the descendentParent lookup
    */
    ancestorChild: {
        second: { 'c': enums.params.period.instant, 'd': '1000' },
        minute: { 'c': enums.params.period.second, 'd': '60' },
        hour: { 'c': enums.params.period.minute, 'd': '60' },
        timeofday: { 'c': enums.params.period.hour, 'd': '6' },
        day: { 'c': enums.params.period.hour, 'd': '24' },
        week: { 'c': enums.params.period.day, 'd': '7' },
        // monthday is derived dynamically
        month: { 'c': enums.params.period.day, 'd': this.NONE },
        quarter: { 'c': enums.params.period.month, 'd': '3' },
        year: { 'c': enums.params.period.quarter, 'd': '4' },
        fiveyear: { 'c': enums.params.period.year, 'd': '5' },
        minutesecond: { 'c': enums.params.period.instant, 'd': '1000' },
        hourminute: { 'c': enums.params.period.second, 'd': '60' },
        timeofdayhour: { 'c': enums.params.period.minute, 'd': '60' },
        dayhour: { 'c': enums.params.period.minute, 'd': '60' },
        weekday: { 'c': enums.params.period.timeofday, 'd': '4' },
        monthday: { 'c': enums.params.period.hour, 'd': '24' },
        // monthday is derived dynamically
        quartermonth: { 'c': enums.params.period.day, 'd': this.NONE },
        yearquarter: { 'c': enums.params.period.month, 'd': '3' },
        fiveyearyear: { 'c': enums.params.period.quarter, 'd': '4' }
    },

    /* parent period lookup.  the lookup is child => parent or grandchild-+-child => grandparent.
    this lookup needs to be commutatively equivalent to the ancestorChild lookup
    */
    descendentParent: {
        instant: enums.params.period.second,
        second: enums.params.period.minute,
        minute: enums.params.period.hour,
        hour: enums.params.period.day,
        day: enums.params.period.month,
        timeofday: enums.params.period.day,
        week: enums.params.period.month,
        month: enums.params.period.quarter,
        quarter: enums.params.period.year,
        year: enums.params.period.fiveyear,
        instantsecond: enums.params.period.minute,
        secondminute: enums.params.period.hour,
        minutehour: enums.params.period.day,
        timeofdayday: enums.params.period.week,
        hourday: enums.params.period.month,
        daymonth: enums.params.period.quarter,
        weekmonth: enums.params.period.year,
        monthquarter: enums.params.period.year,
        quarteryear: enums.params.period.fiveyear
    },

    // the lookup is parent-child e.g. weekday. returns space delimited labels to diisplay as headers for child or grandchild periods when presented in a parent context. 
    childDescription: {
        secondinstant: this.NONE,
        minutesecond: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60',
        hourminute: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60',
        timeofdayhour: { 'night': '00 01 02 03 04 05', 'morning': '06 07 08 09 10 11', 'afternoon': '12 13 14 15 16 17', 'evening': '18 19 20 21 22 23' },
        dayhour: '00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23',
        daytimeofday: 'Night Morning Afternoon Evening',
        weekday: 'Mon Tue Wed Thu Fri Sat Sun',
        // monthday is appended dynamically to the dates for Feb (the shortest month) for better performance
        monthday: '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28',
        quartermonth: { 'Q1': 'Jan Feb Mar', 'Q2': 'Apr May Jun', 'Q3': 'Jul Aug Sep', 'Q4': 'Oct Nov Dec' },
        yearquarter: 'Q1 Q2 Q3 Q4',
        fiveyearyear: this.NONE,
    },

    // returns a format string for UTC compresed datetime for use in links and identifiers
    datetimeISO: {
        instant: 'YYYYMMDDTHHmmss.SSSS',
        second: 'YYYYMMDDTHHmmss',
        minute: 'YYYYMMDDTHHmm',
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
        instant: '1',                                                       // max allowed for time periods is 1 due to large number of items in each collection 
        second: '1',
        minute: '1',
        hour: '1',
        timeofday: '8',                                             // max allowed for time-of-day is 8 (2 days)  
        day: '31',                                                  // only 4 items per day    
        week: '12',
        month: '3',                                             // there are 31 items in a month.. so cap to 3 (1 quarter)
        quarter: '8',
        year: '5',
        fiveyear: '5'
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
        api_key: 'api_key',                                                 // header param, must be lower case
        accepttype: 'accept'
    },
    defaults: {
        site: '999',
        duration: '1'                                                       // energy apiu duration parameter 
    }
}

// constants for the api and host
module.exports.api = {
    versions: {
        supported: '0.2 0.3',
        current: '0.3.12.10'
    }
}

// kafkajs client configuration options
module.exports.kafkajs = {
    producer: {                                                             // https://kafka.js.org/docs/producing   
        clientId: PRODUCER_CLIENTID,                                        // producer client id prefix - preferred convention = <api path>.<api path>
        connectionTimeout: 3000,                                            // milliseconds to wait for a successful connection   
        requestTimeout: 25000,                                              // milliseconds to wait for a successful request.    
        timeout: 30000,
        retry: {                                                            // retry options  https://kafka.js.org/docs/configuration
            maxRetryTime: 10000,                                            // max milliseconds wait for a retry (30000)
            initialRetryTime: 100,                                          // initial value in milliseconds, randomized after first time (300)
            factor: 0.2,                                                    // Randomization factor	   
            multiplier: 2,                                                  // Exponential factor
            retries: 8,                                                     // max number of retries per call (5)
            maxInFlightRequests: 200                                        // max num requestsin progress at any time. If falsey then no limit (null)
        }
    }
}

// system configuration constants
module.exports.system = {
    MONITORING_PRECISION: 4,                                                // decimal places for float values in monitoring dataset
    BODYPARSER_LIMIT_MB: 1                                                  // max mb for post messages 
}
    
// constants for the environment
module.exports.environments = {
    local: {
        api: { host: '192.168.1.106:8080', scheme: 'http' },
        kafka: {
            brokers: ['192.168.1.106:9092']                                 // localhost   | 192.168.1.106        
        },
        log: { verbose: false }
    },
    devcloudtest: {                                                         // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'api.endpoints.sundaya.cloud.goog', scheme: 'https' },
        kafka: {
            brokers: ['kafka-1-vm:9092']                                    // array of kafka message brokers         // kafka-1-vm  | 10.140.0.11
        },
        log: { verbose: false }
    },
    devcloud: {                                                             // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'api.endpoints.sundaya.cloud.goog', scheme: 'https' },
        kafka: {
            brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']           // array of kafka message brokers         '[kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        },
        log: { verbose: false }
    },
    prodcloud: {                                                            // Kafka HA - 3 masters, N workers
        api: { host: 'api.endpoints.sundaya.cloud.goog', scheme: 'https' },
        kafka: {
            brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']           // array of kafka message brokers         '[kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        },
        log: { verbose: false }
    }
}

// env sets the active environment - change this to one of the environments in consts.environments -0 eg. change to 'devcloud' before release
module.exports.env = 'devcloudtest';                                               // local or devcloud or prodcloud

// system constants
module.exports.NONE = global.undefined;

