//@ts-check
'use strict';

/**
 * ./environment/log.js
 * performs all logging operations including changes to log levels at runtime 
 */
const enums = require('./enums');
const env = require('./env');
const Stackdriver = require('./Stackdriver');
const Console = require('./Console');

// create stackdriver and console appenders
const sdLogger = new Stackdriver();
const consoleLogger = new Console();

// logs a message broker event - both info and debug will be logged if active
module.exports.messaging = (topic, offset, msgsArray, itemQty, sender) => {

    // check statement
    if (isMessaging()) {

        if (env.active.logging.appenders.includes(enums.logging.appenders.console)) {
            
        }

        // append info 
        if (isInfo()) {

            const severity = "INFO";

            // append stackdriver     
            if (isStackdriver()) {
                let infoPayload = {
                    topic: topic,
                    offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                    msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
                };
                sdLogger.log(infoPayload, severity);
            }

            // append console                                                                   // e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001             
            if (isConsole()) {
                console.log(`[${infoPayload.topic}:${infoPayload.offset}] ${infoPayload.msgsqty} msgs, ${infoPayload.itemqty} items, sender:${infoPayload.sender}`);
        }


    }


    if (isLoggable(
        enums.logging.statements.messaging,
        enums.logging.verbosity.info,
        enums.logging.appenders.stackdriver)) {

        // append console                                                               // e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001
        if (loggingConf.appenders.includes(enums.logging.appenders.console)) {
            console.log(`[${infoPayload.topic}:${infoPayload.offset}] ${infoPayload.msgsqty} msgs, ${infoPayload.itemqty} items, sender:${infoPayload.sender}`);
        };

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


