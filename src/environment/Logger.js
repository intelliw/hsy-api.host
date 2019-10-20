//@ts-check
"use strict";
/**
 * ./environment/Stackdriver.js
 *  Stackdriver logging and error reporting appender  
 */
const enums = require('./enums');
const env = require('./env');

class Logger {
    /**
     * constructor arguments 
     * @param {*} 
     */
    constructor() {
        
        // toggle console logging based on current configs
        this._toggle_messagingConsole();
        this._toggle_dataConsole();
        
    }

    // message broker log events
    messaging(topic, offset, msgsArray, itemQty, sender) { };
    _messagingConsole(topic, offset, msgsArray, itemQty, sender) { };
    _messagingConsoleInfo(topic, offset, msgsArray, itemQty, sender) { };
    _messagingConsoleDebug(topic, offset, msgsArray, itemQty, sender) { };

    _toggle_messagingConsole() {

        // messaging console
        this._messagingConsole = this.isConsole() ? function (topic, offset, msgsArray, itemQty, sender) {
            this._messagingConsoleInfo(topic, offset, msgsArray, itemQty, sender);
            this._messagingConsoleDebug(topic, offset, msgsArray, itemQty, sender);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging console info
        this._messagingConsoleInfo = this.isInfo() ? function (topic, offset, msgsArray, itemQty, sender) {
            console.log(`[${topic}:${offset}-${Number(offset) + (msgsArray.length - 1)}] ${msgsArray.length} msgs, ${itemQty} items, sender:${sender}`);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

        // messaging console debug
        this._messagingConsoleDebug = this.isDebug() ? function (topic, offset, msgsArray, itemQty, sender) {
            let debugPayload = {
                messages: msgsArray, topic: topic,
                offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
                msgsqty: msgsArray.length, itemqty: itemQty, sender: sender
            };
            console.log(debugPayload);
        } : function (topic, offset, msgsArray, itemQty, sender) { };

    }        

    // data transaction events 
    data(dataset, table, id, rowArray) { } ;
    _dataConsole(dataset, table, id, rowArray) { };
    _dataConsoleInfo(dataset, table, id, rowArray) { };
    _dataConsoleDebug(dataset, table, id, rowArray) { };

    _toggle_dataConsole() {

        // data console
        this._dataConsole = this.isConsole() ? function (dataset, table, id, rowArray) {
            this._dataConsoleInfo(dataset, table, id, rowArray);
            this._dataConsoleDebug(dataset, table, id, rowArray);
        } : function (dataset, table, id, rowArray) { };

        // data console info
        this._dataConsoleInfo = this.isInfo() ? function (dataset, table, id, rowArray) {
            console.log(`[${dataset}.${table}}] id: ${id}, ${rowArray.length} rows`);
        } : function (dataset, table, id, rowArray) { };

        // data console debug
        this._dataConsoleDebug = this.isDebug() ? function (dataset, table, id, rowArray) {
            let debugPayload = {
                dataset: dataset, table: table, id: id,
                rows: rowArray, rowqty: rowArray.length
            };
            console.log(debugPayload);
        } : function (dataset, table, id, rowArray) { };

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
