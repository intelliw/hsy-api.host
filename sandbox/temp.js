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

const SEVERITY_INFO = "INFO";
const SEVERITY_DEBUG = "DEBUG";

class Stackdriver extends Logger {
    /**
     * constructor arguments 
     * @param {*} 
     */
    constructor() {

        super();

        this._toggleFeatures();

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
    messaging(topic, offset, msgsArray, itemQty, sender) { };

    _messagingStackdriver(topic, offset, msgsArray, itemQty, sender) { };
    _messagingStackdriverInfo(topic, offset, msgsArray, itemQty, sender) { };
    _messagingStackdriverDebug(topic, offset, msgsArray, itemQty, sender) { };

    _messagingConsole(topic, offset, msgsArray, itemQty, sender) { };
    _messagingConsoleInfo(topic, offset, msgsArray, itemQty, sender) { };
    _messagingConsoleDebug(topic, offset, msgsArray, itemQty, sender) { };

    // logs a data transaction - both info and debug will be logged if active
    data(dataset, table, id, rowArray) {                           //[${this.dataset}.${this.table}] id: ${sharedId}, ${rowArray.length} rows`);

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
            console.error(`>>>>>> STACKDRIVER LOGGING ERROR: ${e.message}`, e)
        }

    }

    _toggleFeatures() {
        console.log("TOGGLING.......................");
        // messsaging
        this.messaging = super.isMessaging() ? function (topic, offset, msgsArray, itemQty, sender) {
            this._messagingStackdriver(topic, offset, msgsArray, itemQty, sender);
            this._messagingConsole(topic, offset, msgsArray, itemQty, sender);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver
        this._messagingStackdriver = super.isStackdriver() ? function (topic, offset, msgsArray, itemQty, sender) {
            this._messagingStackdriverInfo(topic, offset, msgsArray, itemQty, sender);
            this._messagingStackdriverDebug(topic, offset, msgsArray, itemQty, sender);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver info
        console.log(super.isInfo());
        this._messagingStackdriverInfo = super.isInfo() ? function (topic, offset, msgsArray, itemQty, sender) {
            console.log("INFO");
            let infoPayload = {
                topic: topic,
                offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
            };
            this._writeLog(SEVERITY_INFO, infoPayload);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver debug
        console.log(super.isDebug());
        this._messagingStackdriverDebug = super.isDebug() ? function (topic, offset, msgsArray, itemQty, sender) {
            console.log("DEBUG");
            let debugPayload = {
                messages: msgsArray, topic: topic,
                offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
            };
            this._writeLog(SEVERITY_DEBUG, debugPayload);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging console
        this._messagingConsole = super.isConsole() ? function (topic, offset, msgsArray, itemQty, sender) {
            this._messagingConsoleInfo(topic, offset, msgsArray, itemQty, sender);
            this._messagingConsoleDebug(topic, offset, msgsArray, itemQty, sender);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver info
        this._messagingConsoleInfo = super.isInfo() ? function (topic, offset, msgsArray, itemQty, sender) {
            console.log(`[${topic}:${offset}-${Number(offset) + (msgsArray.length - 1)}] ${msgsArray.length} msgs, ${itemQty} items, sender:${sender}`);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver debug
        this._messagingConsoleDebug = super.isDebug() ? function (topic, offset, msgsArray, itemQty, sender) {
            let debugPayload = {
                messages: msgsArray, topic: topic,
                offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
            };
            console.log(debugPayload);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

    }    
}

// INFO

module.exports = Stackdriver;
