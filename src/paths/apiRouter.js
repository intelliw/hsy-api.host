//@ts-check
'use strict';
/**
 * ./path/devops.js
 * handlers for /api path, which is for devops
 * basepath /api
 */
const express = require('express');
const router = express.Router();

const producers = require('../producers');

const enums = require('../environment/enums');
const consts = require('../host/constants');

const env = require('../environment');
const log = require('../logger').log;

let utils = env.utils;

// [devops.api.versions.get] /api/versions
router.get('/versions', (req, res, next) => {

    res
        .status(200)
        .json({ versions: env.active.api.versions.supported })
        .end();

});

// [devops.api.logging.help.get] /api/logging/help
router.get('/logging/help', (req, res, next) => {

    // return logging configurables 
    res
        .status(200)
        .json({
            logging: {
                configurables: {
                    statements: utils.objectKeysToArray(enums.logging.statements),
                    verbosity: utils.objectKeysToArray(enums.logging.verbosity),
                    appenders: utils.objectKeysToArray(enums.logging.appenders)
                }
            }
        })                         // e.g. {"logging":{"verbosity":["info"]}}
        .end();

});


// [devops.api.logging.get] /api/logging?verbosity=debug,info
router.get('/logging', (req, res, next) => {

    let configs = [];
    let hasChanged = false

    // validate and set configs  set only if requested values are valid enums
    configs = setLoggingConfigs(req.query.appenders, enums.logging.appenders);
    env.active.logging.appenders = configs.length == 0 ? env.active.logging.appenders : configs;
    hasChanged = hasChanged || configs.length > 0;

    configs = setLoggingConfigs(req.query.verbosity, enums.logging.verbosity);
    env.active.logging.verbosity = configs.length == 0 ? env.active.logging.verbosity : configs;
    hasChanged = hasChanged || configs.length > 0;

    configs = setLoggingConfigs(req.query.statements, enums.logging.statements);
    env.active.logging.statements = configs.length == 0 ? env.active.logging.statements : configs;
    hasChanged = hasChanged || configs.length > 0;

    // if there were changes reconfigure the logger
    if (hasChanged) { 
        log.initialise(); 
        
        let sender = utils.keynameFromValue(enums.apiKey, enums.apiKey.PROXY);      // sender is the system PROXY as it is an internal message

        // communicate logging config changes from host to consumer instances  
        let producer = producers.getProducer(enums.feature.operational.logging);                // returns a Features producer, apiPathIdentifier = enums.feature.. 
        producer.sendToTopic(env.active.logging, sender);                           // send the complete logging configs to the topic: which is env.active.topics.system.feature

        // log it
        log.trace(`${enums.feature.operational.logging}`, producer.kafkaTopic, env.active.logging);
        
    }

    // return logging configuration 
    res
        .status(200)
        .json({ logging: env.active.logging })                                      // e.g. {"logging":{"verbosity":["info"]}}
        .end();

});

/* validates and returns an array of logging configs according to the query paramers (queryParams) 
   queryParams must contain comma serparated configuration options for appenders, verbosity, or statements 
   only values which exist in the corresponding enums.logging (logginEnum) will be allowed
   if there are no valid values the existing configs will not be changed
*/
function setLoggingConfigs(queryParams, loggingEnum) {

    let configs = [];

    if (queryParams != consts.NONE) {
        configs = [];
        queryParams.split(',').forEach(element => {                                 // split into an array and set logging.verbosity     
            if (utils.valueExistsInObject(loggingEnum, element)) {
                configs.push(element);
            }
        });
    }
    return configs


}

module.exports = router;
