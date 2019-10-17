//@ts-check
'use strict';

/**
 * ./host/log.js
 * performs all logging operations including changes to log levels at runtime 
 */
const { Logging } = require('@google-cloud/logging');                                   // google cloud logging client library
const enums = require('../host/enums');
const env = require('../host/environments');

// create a Logging instance and a log writer
const LOGGER = new Logging({
    // projectId: 'my-project-id',
}).log(env.stackdriver.logging.logName);                                            // select the log to write to        



// logs a message broker event - both info and debug will be logged if active
module.exports.messaging = (topic, offset, msgsArray, itemQty, sender) => {

    const loggingConf = env.env[env.env.active].logging;                        // get the current logging configurations

    // append info 
    if (loggingConf.verbosity.includes(enums.logging.verbosity.info)) {                 // if info logging on..

        // append stackdriver     
        let infoPayload = {
            topic: topic,
            offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
            msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
        };
        logInfo(infoPayload);

        // append console                                                               // e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001
        if (loggingConf.appenders.includes(enums.logging.appenders.console)) {
            console.log(`[${infoPayload.topic}:${infoPayload.offset}] ${infoPayload.msgsqty} msgs, ${infoPayload.itemqty} items, sender:${infoPayload.sender}`);
        };

    }

    // append debug
    if (loggingConf.verbosity.includes(enums.logging.verbosity.debug)) {                // if debug logging on..  e.g. [ { key: '025', value: '[{"pms_id" ....      

        // append stackdriver     
        let debugPayload = {
            messages: msgsArray, topic: topic,
            offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
            msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
        };
        logDebug(debugPayload);

        // append console            
        if (loggingConf.appenders.includes(enums.logging.appenders.console)) {
            console.log(debugPayload);
        };

    }

}

// logs a data transaction - both info and debug will be logged if active
module.exports.data = (dataset, table, id, rowArray) => {
    //[${this.dataset}.${this.table}] id: ${sharedId}, ${rowArray.length} rows`);

    const loggingConf = env.env[env.env.active].logging;                        // get the current logging configurations

    // append info 
    if (loggingConf.verbosity.includes(enums.logging.verbosity.info)) {                 // if info logging on..

        // append stackdriver     
        let infoPayload = { dataset: dataset, table: table, id: id, rowqty: rowArray.length };
        logInfo(infoPayload);

        // append console                                                               // e.g. [monitoring.dev_pms] id: TEST-09, 1 rows     
        if (loggingConf.appenders.includes(enums.logging.appenders.console)) {
            console.log(`[${infoPayload.dataset}.${infoPayload.table}] id: ${infoPayload.id}, ${infoPayload.rowqty} rows`);          
        };

    }

    // append debug
    if (loggingConf.verbosity.includes(enums.logging.verbosity.debug)) {                // if debug logging on..  e.g. [ { key: '025', value: '[{"pms_id" ....      

        // append stackdriver     
        let debugPayload = { rows: rowArray, dataset: dataset, table: table, id: id, rowqty: rowArray.length };
        logDebug(debugPayload);

        // append console            
        if (loggingConf.appenders.includes(enums.logging.appenders.console)) {
            console.log(debugPayload);
        };

    }

}

// INFO
async function logInfo(jsonPayload) {

    // append stackdriver
    try {

        const loggingConf = env.env[env.env.active].logging;                    // get the current logging configurations

        if (loggingConf.appenders.includes(enums.logging.appenders.stackdriver)) {

            // create metadata to describe logs from this resource (compute instance, INFO)
            const metadata = {                                                          // the metadata associated with a log entry
                resource: {
                    type: env.stackdriver.logging.resource
                },
                severity: "INFO"                                                        // LogSeverity      https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity    
            };

            // write  log entry
            LOGGER.write([
                LOGGER.entry(                                                           // construct the log message
                    metadata, jsonPayload)
            ]);
        };

    } catch (e) {
        console.error(`>>>>>> LOGGING ERROR: ${e.message}`, e)
    }

}


// DEBUG
async function logDebug(jsonPayload) {

    // append stackdriver   
    try {

        const loggingConf = env.env[env.env.active].logging;                    // get the current logging configurations

        if (loggingConf.appenders.includes(enums.logging.appenders.stackdriver)) {

            // create metadata to describe logs from this resource (compute instance, INFO)
            const metadata = {                                                          // the metadata associated with a log entry
                resource: {
                    type: env.stackdriver.logging.resource
                },
                severity: "DEBUG"                                                       // LogSeverity      https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity    
            };

            // write  log entry                                               
            LOGGER.write([
                LOGGER.entry(                                                           // construct the log message
                    metadata, jsonPayload)                                              // e.g. [ { key: '025', value: '[{"pms_id" ....      
            ]);

        };

    } catch (e) {
        console.error(`>>>>>> LOGGING ERROR: ${e.message}`, e)
    }

}