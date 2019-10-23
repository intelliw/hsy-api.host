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

let messagingStatement;
let dataStatement;

class Logger {
    /**
     * instance variables
     * this.messaging, this.data, this.error, this.exception, this.trace
     */
    constructor() {

        this.initialise();

    }

    // toggle logging based on current configs
    initialise() {                                                              // called by constructor and by api/logging at runtim  

        // create a Stackdriver log writer and error reporter
        const project = env.active.gcp.project;
        const logname = env.active.stackdriver.logging.logName;
        const logWriter = new Logging({                                     
            projectId: project,
        }).log(logname);                                                        // select the log to write to        

        // create a Stackdriver error reporter        
        const errorReporter = new ErrorReporting({                              // all configuration options are optional.
            reportMode: env.active.stackdriver.errors.reportMode,               // 'production' (default), 'always', 'never' - production will not log unless NODE-ENV=production. Specifies when errors are reported to the Error Reporting Console. 
            logLevel: env.active.stackdriver.errors.logLevel                    // 2 (warnings). 0 (no logs) 5 (all logs) 
        });

        // create an instance of each statement     
        messagingStatement = new MessagingStatement(logWriter);
        dataStatement = new DataStatement(logWriter);

        // setup the public interface of this logger          
        this.messaging = function (topic, offset, msgsArray, itemQty, sender) { 
            messagingStatement.write(topic, offset, msgsArray, itemQty, sender);
        }
        this.data = function (dataset, table, id, rowArray) {
            dataStatement = write(dataset, table, id, rowArray);
        }

    }

}
module.exports = Logger;
