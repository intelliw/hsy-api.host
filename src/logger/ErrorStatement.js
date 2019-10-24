//@ts-check
"use strict";
/**
 * ./environment/ErrorStatement.js
 *  logs statements about data transaction events 
 */
const enums = require('../environment/enums');
const env = require('../environment/env');

const Statement = require('./Statement');

class ErrorStatement extends Statement {

    // constructor
    constructor(logWriter, errorReporter) {


        super(logWriter, errorReporter);
        this.statementName = enums.logging.statements.error;
        this.errorReporter = errorReporter;
        this.initialise();
    }

    // entrypoint for clients to call. // errObject is a Error object created with 'new Error(message)'
    write(label, errObject) {

        this._writeConsoleInfo(label, errObject);
        this._writeConsoleDebug(label, errObject);
        this._writeStackdriverInfo(label, errObject);
        this._writeStackdriverDebug(label, errObject);

    }

    // calls to super - these are annulled by initialise function based on configs  
    _writeConsoleInfo(label, errObject) {
        let payload = `[${label}] message: ${errObject.message}`;
        super._writeConsole(this.statementName, Statement.Severity.ERROR, payload);
    }
    _writeConsoleDebug(label, errObject) {
        let payload = {
            stack: errObject.stack, label: label, message: errObject.message
        }
        super._writeConsole(this.statementName, Statement.Severity.ERROR, payload);
    }

    // errors write the same content once only for info or debug, not both.
    _writeStackdriverInfo(label, errObject) {
        let payload = {
            stack: errObject.stack, label: label, message: errObject.message, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.ERROR, payload);
        this.errorReporter.report(errObject);

    };
    _writeStackdriverDebug(label, errObject) {
        if (!super._isInfo()) {                                                                         // write only if info has not written 
            let payload = {
                stack: errObject.stack, label: label, message: errObject.message, statement: this.statementName
            }
            super._writeStackdriver(this.statementName, Statement.Severity.ERROR, payload);
            this.errorReporter.report(errObject);
        }
    }


    // annul write methods based on current configs
    initialise() {                                                                                      // called by conmstructor

        // messaging
        if (!super._isError()) {
            this.write = function (label, errObject) { };
        }

        // Stackdriver
        if (!super._isStackdriver()) {
            this._writeStackdriverInfo = function (label, errObject) { };
            this._writeStackdriverDebug = function (label, errObject) { };
        } else {
            if (!super._isInfo()) {
                this._writeStackdriverInfo = function (label, errObject) { };
            }
            if (!super._isDebug()) {
                this._writeStackdriverDebug = function (label, errObject) { }; this._writeStackdriverDebug = function (label, errObject) { };
            }
        }

        // Console
        if (!super._isConsole()) {
            this._writeConsoleInfo = function (label, errObject) { };
            this._writeConsoleDebug = function (label, errObject) { };
        } else {
            if (!super._isInfo()) {
                this._writeConsoleInfo = function (label, errObject) { };
            }
            if (!super._isDebug()) {
                this._writeConsoleDebug = function (label, errObject) { };
            }
        }
    }

}

module.exports = ErrorStatement;
