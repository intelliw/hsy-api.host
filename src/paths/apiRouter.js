//@ts-check
'use strict';
/**
 * ./path/apiRouter.js
 * handlers for /api path
 */
const express = require('express');
const router = express.Router();

const consumers = require('../consumers');
const Param = require('../parameters');

const enums = require('../environment/enums');
const consts = require('../host/constants');

const env = require('../environment');
const log = require('../logger').log;
const utils = env.utils;

// [admin.api.get] /api
router.get('/', (req, res, next) => {

    res
        .status(200)
        .json({
            paths: utils.objectKeysToArray(enums.paths),                            // e.g. {"paths":["logging","features","versions"]}        
            api: {
                logging: {                                                          // e.g. {"logging":{"verbosity":["info"]}}
                    statements: utils.objectKeysToArray(enums.logging.statements),
                    verbosity: utils.objectKeysToArray(enums.logging.verbosity),
                    appenders: utils.objectKeysToArray(enums.logging.appenders)
                },
                features: {                                                         // e.g. "{features":{"release":["none"],"operational":["none","logging","validation"],"experiment":["none"],"permission":["none"]}
                    release: utils.objectKeysToArray(enums.features.release),
                    operational: utils.objectKeysToArray(enums.features.operational),
                    experiment: utils.objectKeysToArray(enums.features.experiment),
                    permission: utils.objectKeysToArray(enums.features.permission)
                },
                versions: utils.objectKeysToArray(env.active.api.versions)
            }
        })
        .end();

});


// [admin.api.versions.get] /api/versions
router.get('/versions', (req, res, next) => {
    res.status(200).json({ versions: env.active.api.versions }).end();
});
router.get('/versions/current', (req, res, next) => {
    res.status(200).json({ versions: { current: env.active.api.versions.current } }).end();
});


// [admin.api.logging.get] /api/logging?verbosity=debug,info
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
        
        // communicate logging config changes from host to consumer instances  
        let senderId = Param.ApiKey.getSenderId(enums.apiKey.PROXY);                    // make sender the system PROXY as it is an internal message

        let consumerObj = consumers.getConsumer(enums.paths.api.logging);                  // returns a Features producer
        consumerObj.consume(env.active.logging, senderId);                              // send the complete logging configs to the topic: which is env.active.messagebroker.topics.system.feature

        // trace log the logging config change
        log.trace(log.enums.labels.configChange, `${enums.paths.api.logging}`, env.active.logging);

    }

    // return logging configuration 
    res
        .status(200)
        .json({ logging: env.active.logging })                                          // e.g. {"logging":{"verbosity":["info"]}}
        .end();

});


// [admin.api.feature.get] /api/features?operational=logging,validation
router.get('/features', (req, res, next) => {

    let configs = [];
    let hasChanged = false

    // validate and set configs set only if requested values are valid enums
    configs = setConfigs(req.query.operational, enums.features.operational);
    env.active.features.operational = configs.length == 0 ? env.active.features.operational : configs;
    hasChanged = hasChanged || configs.length > 0;

    // if there were changes reconfigure the features
    if (hasChanged) {

        // communicate logging config changes from host to consumer instances  
        let senderId = Param.ApiKey.getSenderId(enums.apiKey.PROXY);                    // make sender the system PROXY as it is an internal message
        
        let consumerObj = consumers.getConsumer(enums.paths.api.features);                 // returns a Features consumer
        consumerObj.consume(env.active.features, senderId);

        // trace log the features config change
        log.trace(log.enums.labels.configChange, `${enums.paths.api.features}`, env.active.features);

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
