//@ts-check
"use strict";
/**
 * ./environment/Logger.js
 *  Console logging and error reporting appender  
 */
const enums = require('./enums');
const env = require('./env');

class Logger {
    /**
     * constructor arguments 
     * @param {*} 
     */
    constructor() {
        
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

module.exports = Logger;
