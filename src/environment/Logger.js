//@ts-check
"use strict";
/**
 * ./environment/Stackdriver.js
 *  Stackdriver logging and error reporting appender  
 */
const enums = require('./enums');
const env = require('./env');

const Console = require('./Console');
const Stackdriver = require('./Console');

class Logger {
    /**
     * constructor arguments 
     * @param {*} 
     */
    constructor() {

        this.stackdriver = new Stackdriver();
        // this.console = new Console();
    }

    // logs a message broker event - both info and debug will be logged if active
    messaging(topic, offset, msgsArray, itemQty, sender) { 
        
        stackdriver.messaging(topic, offset, msgsArray, itemQty, sender);
        
    };

    // logs a data transaction - both info and debug will be logged if active
    data(dataset, table, id, rowArray) {                           //[${this.dataset}.${this.table}] id: ${sharedId}, ${rowArray.length} rows`);

        if (this.isData()) {

        }
    }


    // check VERBOSITY configs  ----------------------------------------------------------------------------------
    isInfo() {  return env.active.logging.verbosity.includes(enums.logging.verbosity.info); }
    isDebug() { return env.active.logging.verbosity.includes(enums.logging.verbosity.debug); }

    // check STATEMENTS configs ----------------------------------------------------------------------------------
    isData() {  return env.active.logging.statements.includes(enums.logging.statements.data); }
    isMessaging() { return env.active.logging.statements.includes(enums.logging.statements.messaging); }
    isError() { return env.active.logging.statements.includes(enums.logging.statements.error); }
    isException() { return env.active.logging.statements.includes(enums.logging.statements.exception); }
    isTrace() { return env.active.logging.statements.includes(enums.logging.statements.trace); }

    // check APPENDERS configs ----------------------------------------------------------------------------------
    isStackdriver() { return env.active.logging.appenders.includes(enums.logging.appenders.stackdriver); }
    isConsole() { return env.active.logging.appenders.includes(enums.logging.appenders.console); }

}

// INFO

module.exports = Logger;
