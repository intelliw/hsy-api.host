//@ts-check
"use strict";
/**
 * ./environment/Console.js
 * Console logging and error reporting appender  
 * subtype for all loggers 
 */
const enums = require('./enums');
const env = require('./env');

class Console {
    /**
     * constructor arguments 
     * @param {*} 
     */
    constructor() {

    }

    // logs a message broker event - both info and debug will be logged if active
    messaging(topic, offset, msgsArray, itemQty, sender) {

        if (this.isMessaging()) {

            // Console
            if (this.isConsole()) {

                // INFO                         // e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001
                if (this.isInfo()) {
                    console.log(`[${topic}:${offset}-${Number(offset) + (msgsArray.length - 1)}] ${msgsArray.length} msgs, ${itemQty} items, sender:${sender}`);
                }

                // DEBUG                       // e.g. [ { key: '025', value: '[{"pms_id" ....                   
                if (this.isDebug()) {
                    let debugPayload = {
                        messages: msgsArray, topic: topic,
                        offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                        msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
                    };
                    console.log(debugPayload);
                }
            }
        }

    }

    // logs a data transaction - both info and debug will be logged if active
    data(dataset, table, id, rowArray) {
        //[${this.dataset}.${this.table}] id: ${sharedId}, ${rowArray.length} rows`);
    }

    /* returns true or false depending on whether the scope specified in the name matches 
        current logging configurations
    */

    // check VERBOSITY ----------------------------------------------------------------------------------
    isInfo() {

        // check current logging configurations against info
        return env.active.logging.verbosity.includes(enums.logging.verbosity.info);
    }
    isDebug() {

        // check current logging configurations against debug
        return env.active.logging.verbosity.includes(enums.logging.verbosity.debug);
    }

    // check STATEMENTS ----------------------------------------------------------------------------------
    isData() {

        // check current logging configurations against statement
        return env.active.logging.statements.includes(enums.logging.statements.data);
    }
    isMessaging() {

        // check current logging configurations against statement
        return env.active.logging.statements.includes(enums.logging.statements.messaging);
    }
    isError() {

        // check current logging configurations against statement
        return env.active.logging.statements.includes(enums.logging.statements.error);
    }
    isException() {

        // check current logging configurations against statement
        return env.active.logging.statements.includes(enums.logging.statements.exception);
    }
    isTrace() {

        // check current logging configurations against statement
        return env.active.logging.statements.includes(enums.logging.statements.trace);
    }

    // check APPENDERS ----------------------------------------------------------------------------------
    isStackdriver() {

        // check current logging configurations against appender
        return env.active.logging.appenders.includes(enums.logging.appenders.stackdriver);
    }
    isConsole() {

        // check current logging configurations against appender
        return env.active.logging.appenders.includes(enums.logging.appenders.console);
    }

}

module.exports = Console;
