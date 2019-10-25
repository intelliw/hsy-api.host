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

const env = require('../environment');
let enums = require('../environment/enums');
let utils = env.utils;

const log = require('../host').log;

const NONE = global.undefined;

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
        
        // communicate logging config changes from host to consumer instances  
        let producer = producers.getProducer(enums.params.datasets.logging);         // apiDatasetName = enums.params.datasets..
        producer.sendToTopic(env.active.logging, enums.apiKey.PROXY);                    // topic is env.active.topics.features.logging   

    }

    // return logging configuration 
    res
        .status(200)
        .json({ logging: env.active.logging })                      // e.g. {"logging":{"verbosity":["info"]}}
        .end();

});

/* validates and returns an array of logging configs according to the query paramers (queryParams) 
   queryParams must contain comma serparated configuration options for appenders, verbosity, or statements 
   only values which exist in the corresponding enums.logging (logginEnum) will be allowed
   if there are no valid values the existing configs will not be changed
*/
function setLoggingConfigs(queryParams, loggingEnum) {

    let configs = [];

    if (queryParams != NONE) {
        configs = [];
        queryParams.split(',').forEach(element => {                     // split into an array and set logging.verbosity     
            if (utils.valueExistsInObject(loggingEnum, element)) {
                configs.push(element);
            }
        });
    }
    return configs


}

module.exports = router;
