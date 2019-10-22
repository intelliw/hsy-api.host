//@ts-check
"use strict";
/**
 * ./logger/Logger.js
 *  Stackdriver logging and error reporting appender  
 */
const { ErrorReporting } = require('@google-cloud/error-reporting');
const { Logging } = require('@google-cloud/logging');               // google cloud logging client library

const env = require('../environment');


const MessagingStatement = require('./MessagingStatement');
const DataStatement = require('./DataStatement');

class Logger {
    /**
     * instance variables
     * this.messaging, this.data, this.error, this.exception, this.trace
     */
    constructor() {

        this.initialise();

    }

    // toggle logging based on current configs
    initialise() {                                                  // called by constructor and by api/logging at runtim  

        // create a Stackdriver log writer
        const project = env.active.gcp.project;
        const logname = env.active.stackdriver.logging.logName;
        
        const logWriter = new Logging({
            projectId: project,
        }).log(logname);                                            // select the log to write to        

        
        // create an instance of each statement     
        this.messaging = new MessagingStatement(logWriter);
        this.data = new DataStatement(logWriter);

    }

}
module.exports = Logger;
