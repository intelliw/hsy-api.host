//@ts-check
"use strict";
/**
 * ./environment/Statement.js
 *  Stackdriver logging and error reporting appender  
 */
const enums = require('../environment/enums');
const env = require('../environment/env');

const SEVERITY_INFO = "INFO";
const SEVERITY_DEBUG = "DEBUG";

class Statement {

    // constructor
    constructor(logWriter, resourceType) {
        
        // store stackdriver instance and variables  
        this.logWriter = logWriter;
        this.resourceType = resourceType;
    
    }
    
    // Stackdriver write operatation
    async _writeStackdriver(severity, payload) {
        
        // append to active environment's stackdriver log
        try {
            //console.log(this.logWriter)
            // create metadata to describe logs from this resource (compute instance, INFO)
            const metadata = {                                                          // the metadata associated with a log entry
                resource: {
                    type: this.resourceType
                },
                severity: severity                                  // LogSeverity      https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity    
            };

            // write  log entry
            this.logWriter.write([
                this.logWriter.entry(                                                           // construct the log message
                    metadata, payload)
            ]);

        } catch (e) {
            console.error(`>>>>>> STACKDRIVER LOGGING ERROR: ${e.message}`, e)
        }

    }

    // Console write operatation
    async _writeConsole(severity, payload) {
        console.log(`${severity}`, payload)
    }

    
    // check VERBOSITY configs  ----------------------------------------------------------------------------------
    _isInfo() {  return env.active.logging.verbosity.includes(enums.logging.verbosity.info); }
    _isDebug() { return env.active.logging.verbosity.includes(enums.logging.verbosity.debug); }

    // check STATEMENTS configs ----------------------------------------------------------------------------------
    _isData() {  return env.active.logging.statements.includes(enums.logging.statements.data); }
    _isMessaging() { return env.active.logging.statements.includes(enums.logging.statements.messaging); }
    _isError() { return env.active.logging.statements.includes(enums.logging.statements.error); }
    _isException() { return env.active.logging.statements.includes(enums.logging.statements.exception); }
    _isTrace() { return env.active.logging.statements.includes(enums.logging.statements.trace); }

    // check APPENDERS configs ----------------------------------------------------------------------------------
    _isStackdriver() { return env.active.logging.appenders.includes(enums.logging.appenders.stackdriver); }
    _isConsole() { return env.active.logging.appenders.includes(enums.logging.appenders.console); }

}

module.exports = Statement;

// static constants for subtypes to use
module.exports.INFO = SEVERITY_INFO;
module.exports.DEBUG = SEVERITY_DEBUG;
