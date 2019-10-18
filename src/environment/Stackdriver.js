//@ts-check
"use strict";
/**
 * ./environment/Stackdriver.js
 *  Stackdriver logging and error reporting appender  
 */
const enums = require('./enums');
const env = require('./env');

const Logger = require('./Logger');

const { Logging } = require('@google-cloud/logging');               // google cloud logging client library

class Stackdriver extends Logger {
    /**
     * constructor arguments 
     * @param {*} 
     */
    constructor() {
        
        const project = env.active.gcp.project;
        const logname = env.active.stackdriver.logging.logName;
                
        // create a Logging instance and a log writer
        this.logWriter = new Logging({
            projectId: project,
        }).log(logname);                                            // select the log to write to        


    }


    // INFO
    async log(jsonPayload, severity) {

        // append to active environment's stackdriver log
        try {

            // create metadata to describe logs from this resource (compute instance, INFO)
            const metadata = {                                                          // the metadata associated with a log entry
                resource: {
                    type: env.active.stackdriver.logging.resource
                },
                severity: severity                                  // LogSeverity      https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity    
            };

            // write  log entry
            this.logWriter.write([
                this.logWriter.entry(                                                           // construct the log message
                    metadata, jsonPayload)
            ]);

        } catch (e) {
            console.error(`>>>>>> LOGGING ERROR: ${e.message}`, e)
        }

    }

}

module.exports = Stackdriver;
