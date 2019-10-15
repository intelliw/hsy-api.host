//@ts-check
'use strict';

/**
 * ./common/logging.js
 * performs all logging operations including changes to log levels at runtime 
 */
const { Logging } = require('@google-cloud/logging');                                   // google cloud logging client library
const enums = require('../host/enums');
const configc = require('../common/configc');


// create a Logging instance and a log writer
const LOGGER = new Logging({
    // projectId: 'my-project-id',
}).log(configc.stackdriver.logging.logName);                                            // select the log to write to        



// logs a messaging broker event - both info and debug depending on whether these are active
module.exports.messagingEvent = (topic, offset, msgsArray, itemsQty, sender) => {

    const loggingConf = configc.env[configc.env.active].logging;                        // get the current logging configurations

    // create the payload 
    let jsonPayload = {
        topic: topic,                                                                   // e.g. monitoring.mppt 
        offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,                 // e.g. 225-229
        msgsqty: msgsArray.length,
        itemqty: itemsQty,
        sender: sender
    }
    
    // append info 
    if (loggingConf.verbosity.includes(enums.logging.verbosity.info)) {                 // if info logging on..
        appendInfo(jsonPayload);
    }
    
    // append debug
    if (loggingConf.verbosity.includes(enums.logging.verbosity.debug)) {                // if debug logging on..  e.g. [ { key: '025', value: '[{"pms_id" ....      
        jsonPayload.messages = msgsArray;                                               // add messages for debug   
        appendDebug(jsonPayload);
    }
    
}

// INFO
async function appendInfo(jsonPayload) {
    

    try {
        
        const loggingConf = configc.env[configc.env.active].logging;                    // get the current logging configurations

        // append stackdriver                                                         
        if (loggingConf.appenders.includes(enums.logging.appenders.stackdriver)) {

            // create metadata to describe logs from this resource (compute instance, INFO)
            const metadata = {                                                          // the metadata associated with a log entry
                resource: {
                    type: configc.stackdriver.logging.resource
                },
                severity: "INFO"                                                        // LogSeverity      https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity    
            };

            // write  log entry
            LOGGER.write([
                LOGGER.entry(                                                           // construct the log message
                    metadata, jsonPayload)
            ]);
        };


        // append console            
        if (loggingConf.appenders.includes(enums.logging.appenders.console)) {
            console.log(`[${jsonPayload.topic}:${jsonPayload.offsetRange}] ${jsonPayload.msgsqty} msgs, ${jsonPayload.itemsqty} items, sender:${jsonPayload.sender}`);          // e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001
        };

    } catch (e) {
        console.error(`>>>>>> LOGGING ERROR: ${e.message}`, e)
    }

}


// DEBUG
async function appendDebug(jsonPayload) {

    try {
        
        const loggingConf = configc.env[configc.env.active].logging;                    // get the current logging configurations

        // append stackdriver                                                         
        if (loggingConf.appenders.includes(enums.logging.appenders.stackdriver)) {

            // create metadata to describe logs from this resource (compute instance, INFO)
            const metadata = {                                                          // the metadata associated with a log entry
                resource: {
                    type: configc.stackdriver.logging.resource
                },
                severity: "DEBUG"                                                       // LogSeverity      https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity    
            };

            // write  log entry                                               
            LOGGER.write([
                LOGGER.entry(                                                           // construct the log message
                    metadata, jsonPayload)                                              // e.g. [ { key: '025', value: '[{"pms_id" ....      
            ]);

        };

        // append console            
        if (loggingConf.appenders.includes(enums.logging.appenders.console)) {
            console.log(jsonPayload);
        };

    } catch (e) {
        console.error(`>>>>>> LOGGING ERROR: ${e.message}`, e)
    }

}
