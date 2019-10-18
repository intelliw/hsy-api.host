//@ts-check
"use strict";
/**
 * ./environment/Stackdriver.js
 *  Stackdriver logging and error reporting appender  
 */
const enums = require('./enums');
const env = require('./env');

const Console = require('./Console');

const { Logging } = require('@google-cloud/logging');               // google cloud logging client library

const SEVERITY_INFO = "INFO";
const SEVERITY_DEBUG = "DEBUG";

class Stackdriver extends Console {
    /**
     * constructor arguments 
     * @param {*} 
     */
    constructor() {

        super();

        // create a Logging instance and a log writer
        const project = env.active.gcp.project;
        const logname = env.active.stackdriver.logging.logName;
        this.logWriter = new Logging({
            projectId: project,
        }).log(logname);                                            // select the log to write to        

        // get resource type
        this.resourceType = env.active.stackdriver.logging.resource;

    }


    // logs a message broker event - both info and debug will be logged if active
    messaging (topic, offset, msgsArray, itemQty, sender) {
        
        if (super.isMessaging()) {
            
            // Stackdriver
            if (super.isStackdriver()) {

                // INFO
                if (super.isInfo()) {
                    let infoPayload = {
                        topic: topic,
                        offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                        msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
                    };
                    this._writeLog(SEVERITY_INFO, infoPayload);
                } 

                // DEBUG
                if (super.isDebug()) {
                    let debugPayload = {
                        messages: msgsArray, topic: topic,
                        offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                        msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
                    };
                    this._writeLog(SEVERITY_DEBUG, debugPayload);
                }


            }
            
            // Console
            super.messaging (topic, offset, msgsArray, itemQty, sender);

        }

    }

    // logs a data transaction - both info and debug will be logged if active
    data (dataset, table, id, rowArray) {                           //[${this.dataset}.${this.table}] id: ${sharedId}, ${rowArray.length} rows`);
    
        if (super.isData()) {

        }
    } 

    async _writeLog(severity, jsonPayload) {

        // append to active environment's stackdriver log
        try {
    
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
                    metadata, jsonPayload)
            ]);
    
        } catch (e) {
            console.error(`>>>>>> LOGGING ERROR: ${e.message}`, e)
        }
    
    }

}

// INFO

module.exports = Stackdriver;
