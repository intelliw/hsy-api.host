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
        this._setConfig();
        
        // create a Logging instance and a log writer
        const project = env.active.gcp.project;
        const logname = env.active.stackdriver.logging.logName;
        this.logWriter = new Logging({
            projectId: project,
        }).log(logname);                                            // select the log to write to        

        // get resource type
        this.resourceType = env.active.stackdriver.logging.resource;

    }

    // stackdriver write operatation
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

    // message broker log events 
    messaging(topic, offset, msgsArray, itemQty, sender) { };
    _messagingStackdriver(topic, offset, msgsArray, itemQty, sender) { };
    _messagingStackdriverInfo(topic, offset, msgsArray, itemQty, sender) { };
    _messagingStackdriverDebug(topic, offset, msgsArray, itemQty, sender) { };
    
    _toggle_messagingStackdriver() {

        // messsaging
        this.messaging = super.isMessaging() ? function (topic, offset, msgsArray, itemQty, sender) {
            this._messagingStackdriver(topic, offset, msgsArray, itemQty, sender);
            this._messagingConsole(topic, offset, msgsArray, itemQty, sender);          // note - this is implemented in super
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver
        this._messagingStackdriver = super.isStackdriver() ? function (topic, offset, msgsArray, itemQty, sender) {
            this._messagingStackdriverInfo(topic, offset, msgsArray, itemQty, sender);
            this._messagingStackdriverDebug(topic, offset, msgsArray, itemQty, sender);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver info
        this._messagingStackdriverInfo = super.isInfo() ? function (topic, offset, msgsArray, itemQty, sender) {
            let infoPayload = {
                msgsqty: msgsArray.length, itemqty: itemQty, 
                topic: topic, offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                sender: sender
            };
            this._writeLog(SEVERITY_INFO, infoPayload);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging stackdriver debug
        this._messagingStackdriverDebug = super.isDebug() ? function (topic, offset, msgsArray, itemQty, sender) {
            let debugPayload = {
                messages: msgsArray, msgsqty: msgsArray.length, itemqty: itemQty, 
                topic: topic, offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                sender: sender
            };
            this._writeLog(SEVERITY_DEBUG, debugPayload);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

    }    


    // data transaction events
    data(dataset, table, id, rowArray) { } ;
    _dataStackdriver(dataset, table, id, rowArray) { };
    _dataStackdriverInfo(dataset, table, id, rowArray) { };
    _dataStackdriverDebug(dataset, table, id, rowArray) { };

    _toggle_dataStackdriver() {

        // data
        this.data = super.isData() ? function (dataset, table, id, rowArray) {
            this._dataStackdriver(dataset, table, id, rowArray);
            this._dataConsole(dataset, table, id, rowArray);          // note - this is implemented in super
        } : function (dataset, table, id, rowArray) { };

        // messaging stackdriver
        this._dataStackdriver = super.isStackdriver() ? function (dataset, table, id, rowArray) {
            this._dataStackdriverInfo(dataset, table, id, rowArray);
            this._dataStackdriverDebug(dataset, table, id, rowArray);
        } : function (dataset, table, id, rowArray) { };

        // data stackdriver info
        this._dataStackdriverInfo = super.isInfo() ? function (dataset, table, id, rowArray) {
            let infoPayload = {
                rowqty: rowArray.length, dataset: dataset, table: table, id: id 
            };
            this._writeLog(SEVERITY_INFO, infoPayload);
        } : function (dataset, table, id, rowArray) { };

        // data stackdriver debug
        this._dataStackdriverDebug = super.isDebug() ? function (dataset, table, id, rowArray) {
            let debugPayload = {
                data: rowArray,
                rowqty: rowArray.length, dataset: dataset, table: table, id: id
            };
            this._writeLog(SEVERITY_DEBUG, debugPayload);
        } : function (dataset, table, id, rowArray) { };

    }    

    // updates logging functions for current configs
    _setConfig() {

        // toggle stackdriver logging based on current configs
        this._toggle_messagingStackdriver();
        this._toggle_dataStackdriver();

        // call super
        super._setConfig();
    }

}

// INFO

module.exports = Stackdriver;
