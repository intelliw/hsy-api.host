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

class Logger {
    /**
     * constructor arguments 
     * @param {*} 
     */
    constructor() {

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

        if (this.isData()) {

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

        // messsaging
        this.messaging = this.isMessaging() ? function (topic, offset, msgsArray, itemQty, sender) {
            this._messagingStackdriver(topic, offset, msgsArray, itemQty, sender);
            this._messagingConsole(topic, offset, msgsArray, itemQty, sender);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver
        this._messagingStackdriver = this.isStackdriver() ? function (topic, offset, msgsArray, itemQty, sender) {
            this._messagingStackdriverInfo(topic, offset, msgsArray, itemQty, sender);
            this._messagingStackdriverDebug(topic, offset, msgsArray, itemQty, sender);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver info
        this._messagingStackdriverInfo = this.isInfo() ? function (topic, offset, msgsArray, itemQty, sender) {
            let infoPayload = {
                topic: topic,
                offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
            };
            this._writeLog(SEVERITY_INFO, infoPayload);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver debug
        this._messagingStackdriverDebug = this.isDebug() ? function (topic, offset, msgsArray, itemQty, sender) {
            let debugPayload = {
                messages: msgsArray, topic: topic,
                offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
            };
            this._writeLog(SEVERITY_DEBUG, debugPayload);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging console
        this._messagingConsole = this.isConsole() ? function (topic, offset, msgsArray, itemQty, sender) {
            this._messagingConsoleInfo(topic, offset, msgsArray, itemQty, sender);
            this._messagingConsoleDebug(topic, offset, msgsArray, itemQty, sender);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver info
        this._messagingConsoleInfo = this.isInfo() ? function (topic, offset, msgsArray, itemQty, sender) {
            console.log(`[${topic}:${offset}-${Number(offset) + (msgsArray.length - 1)}] ${msgsArray.length} msgs, ${itemQty} items, sender:${sender}`);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver debug
        this._messagingConsoleDebug = this.isDebug() ? function (topic, offset, msgsArray, itemQty, sender) {
            let debugPayload = {
                messages: msgsArray, topic: topic,
                offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
            };
            console.log(debugPayload);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

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
