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
    configs = setConfigs(req.query.appenders, enums.logging.appenders);
    env.active.logging.appenders = configs.length == 0 ? env.active.logging.appenders : configs;
    hasChanged = hasChanged || configs.length > 0;

    configs = setConfigs(req.query.verbosity, enums.logging.verbosity);
    env.active.logging.verbosity = configs.length == 0 ? env.active.logging.verbosity : configs;
    hasChanged = hasChanged || configs.length > 0;

    configs = setConfigs(req.query.statements, enums.logging.statements);
    env.active.logging.statements = configs.length == 0 ? env.active.logging.statements : configs;
    hasChanged = hasChanged || configs.length > 0;

    // if there were changes reconfigure the logger
    if (hasChanged) { 
        log.initialise(); 
        
        let sender = utils.keynameFromValue(enums.apiKey, enums.apiKey.PROXY);      // make sender the system PROXY as it is an internal message

        // communicate logging config changes from host to consumer instances  
        let producer = producers.getProducer(enums.paths.logging);                // returns a Features producer, apiPathIdentifier = enums.features.. 
        producer.sendToTopic(env.active.logging, sender);                           // send the complete logging configs to the topic: which is env.active.topics.system.feature

        // trace log the logging config change
        log.trace(log.enums.labels.configChange, `${enums.paths.logging}`, env.active.logging);
        
    }

    // return logging configuration 
    res
        .status(200)
        .json({ logging: env.active.logging })                                          // e.g. {"logging":{"verbosity":["info"]}}
        .end();

});

// [devops.api.features.help.get] /api/logging/help
router.get('/features/help', (req, res, next) => {

    // return features configurables 
    res
        .status(200)
        .json({
            features: {
                configurables: {
                    release: utils.objectKeysToArray(enums.features.release),
                    operational: utils.objectKeysToArray(enums.features.operational),
                    experiment: utils.objectKeysToArray(enums.features.experiment),
                    permission: utils.objectKeysToArray(enums.features.permission)
                }
            }
        })                         // e.g. {"logging":{"verbosity":["info"]}}
        .end();

});


// [devops.api.feature.get] /api/features?operational=logging,validation
router.get('/features', (req, res, next) => {

    let configs = [];
    let hasChanged = false

    // validate and set configs set only if requested values are valid enums
    configs = setConfigs(req.query.operational, enums.features.operational);
    env.active.features.operational = configs.length == 0 ? env.active.features.operational : configs;
    hasChanged = hasChanged || configs.length > 0;

    // if there were changes reconfigure the features
    if (hasChanged) { 

        let sender = utils.keynameFromValue(enums.apiKey, enums.apiKey.PROXY);          // make sender the system PROXY as it is an internal message

        // communicate logging config changes from host to consumer instances  
        let producer = producers.getProducer(enums.paths.features);                     // returns a Features producer, apiPathIdentifier = enums.paths.. 
        producer.sendToTopic(env.active.features, sender);                              // send the complete logging configs to the topic: which is env.active.topics.system.feature

        // trace log the features config change
        log.trace(log.enums.labels.configChange, `${enums.paths.features}`, env.active.features);
        
    }

    // return logging configuration 
    res
        .status(200)
        .json({ features: env.active.features })                                        // e.g. {"logging":{"verbosity":["info"]}}
        .end();

});

/* validates and returns an array of (logging or features) configs according to the query paramers (queryParams) 
   queryParams must contain comma separated configuration options. 
   - for logging this would be for appenders, verbosity, or statements 
   - for features this would be for release, operational, experiment, or permission 
   only values which exist in the corresponding configEnum (enums.logging or enums.features) will be allowed
   if there are no valid values the existing configs will not be changed
*/
function setConfigs(queryParams, configEnum) {

    let configs = [];

    if (queryParams != consts.NONE) {
        configs = [];
        queryParams.split(',').forEach(element => {                                 // split into an array and set logging.verbosity     
            if (utils.valueExistsInObject(configEnum, element)) {
                configs.push(element);
            }
        });
    }
    return configs


}

module.exports = router;
