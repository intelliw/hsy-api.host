//@ts-check
'use strict';

/**
 * ./common/logger.js
 * performs all logging operations including changes to log levels at runtime 
 */
const { Logging } = require('@google-cloud/logging');                           // google cloud logging client library
const enums = require('../host/enums');
const config = require('../host/config');
const configc = require('../common/configc');

// create a Logging instance
const loggingObj = new Logging({                                                // All configuration options are optional.
    // projectId: 'my-project-id',
});
const log = loggingObj.log(config.stackdriver.logging.logName);                 // select the log to write to        
const metadata = {                                                              // the metadata associated with a log entry
    resource: { type: config.stackdriver.logging.resource },
};

// verbosity - determines the loglevel and can be set through api/verbosity path 
module.exports.verbosity = [enums.logger.verbosity.info];                       // defult is [enums.logger.verbosity.info] this can be changed at runtime through GET: api/logger?verbosity=info,debug;

// info and debug
module.exports.infoDebug = (topic, offset, msgsarray, itemsqty, sender) => {

    let msgsqty = msgsarray.length;
    let offsetRange = `${offset}-${Number(offset) + (msgsqty - 1)}`;            // e.g. 225-229
    let envLogOutput = configc.env[configc.env.active].logger.output;           // the outputs configured for the current environment

    // info --------------------------------------------------------------------------------------------------------------------------
    if (this.verbosity.includes(enums.logger.verbosity.info)) {                 // if info logging on..

        // write stackdriver                                                         
        if (envLogOutput.includes(enums.logger.outputs.stackdriver)) {

            let logEntry = log.entry(                                           // construct the log message
                metadata,
                {
                    topic: topic,                                                 // e.g. monitoring.mppt 
                    offset: offsetRange,                                          // e.g. 225-229
                    msgs: msgsqty,
                    items: itemsqty,
                    sender: sender
                }
            );
            log.write([logEntry]);
        };

        // write console            
        if (envLogOutput.includes(enums.logger.outputs.console)) {
            console.log(`[${topic}:${offsetRange}] ${msgsqty} msgs, ${itemsqty} items, sender:${sender}`);          // e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001
        };
    }


    // debug --------------------------------------------------------------------------------------------------------------------------
    if (this.verbosity.includes(enums.logger.verbosity.debug)) {                // if debug logging on..  e.g. [ { key: '025', value: '[{"pms_id" ....      
        this.debug(msgsarray);
    }

}

// debug on its own
module.exports.debug = (msgsarray) => {


    // debug                                                                    
    if (this.verbosity.includes(enums.logger.verbosity.debug)) {                // if debug logging on..  

        // write stackdriver                                                         
        if (envLogOutput.includes(enums.logger.outputs.stackdriver)) {

            let logEntry = log.entry(                                           // construct the log message
                metadata,
                { messages: msgsarray }                                         // e.g. [ { key: '025', value: '[{"pms_id" ....      
            );
            log.write([infoLog]);

            console.log(msgsarray);
        }

        // write console            
        if (envLogOutput.includes(enums.logger.outputs.console)) {
            console.log(msgsarray);
        }

    }

}

// produce sd log entry
async function logStackDriver() {
    // A text log entry
    const entry = log.entry(metadata, 'Hello, world!');

    // A structured log entry
    const secondEntry = log.entry(
        metadata,
        {
            name: 'King Arthur',
            quest: 'The palace and his holy Grail',
            favorite_color: 'Red',
        }
    );
    // do not use await - library will handle batching and dispatching of repeat writes
    log.write([entry, secondEntry]);
    console.log(`Wrote to ${config.stackdriver.logging.logName}`);
}
