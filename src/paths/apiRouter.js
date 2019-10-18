//@ts-check
'use strict';
/**
 * ./path/devops.js
 * handlers for /api path, which is for devops
 * basepath /api
 */
const express = require('express');
const router = express.Router();

const env = require('../environment');
let enums = env.enums;
let utils = env.utils;
let log = env.log;

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
        .json({ logging: { configurables: enums.logging } })                         // e.g. {"logging":{"verbosity":["info"]}}
        .end();

});


// [devops.api.logging.get] /api/logging?verbosity=debug,info
router.get('/logging', (req, res, next) => {

    let configs;

    // set appenders - set only if requested values are valid enums
    let appenders = req.query.appenders;                            // e.g. ?appenders=stackdriver,console
    if (appenders != NONE) {
        configs = [];
        appenders.split(',').forEach(element => {                   // split into an array and set logging.verbosity     
            if (utils.valueExistsInObject(enums.logging.appenders, element)) {
                configs.push(element);
            }
        });
        env.active.logging.appenders = configs.length == 0 ? env.active.logging.appenders : configs;
    }

    // set statements - set only if requested values are valid enums
    let statements = req.query.statements;                          // e.g. ?statements=data,error,exception,messaging,trace
    if (statements != NONE) {
        configs = [];
        statements.split(',').forEach(element => {                   // split into an array and set logging.verbosity     
            if (utils.valueExistsInObject(enums.logging.statements, element)) {
                configs.push(element);
            }
        });
        env.active.logging.statements = configs.length == 0 ? env.active.logging.statements : configs;
    }

    // set verbosity - set only if requested values are valid enums
    let verbosity = req.query.verbosity;                            // e.g. ?verbosity=debug,info
    if (verbosity != NONE) {
        configs = [];
        verbosity.split(',').forEach(element => {                   // split into an array and set logging.verbosity     
            if (utils.valueExistsInObject(enums.logging.verbosity, element)) {
                configs.push(element);
            }
        });
        env.active.logging.verbosity = configs.length == 0 ? env.active.logging.verbosity : configs;
    }

    // return logging configuration 
    res
        .status(200)
        .json({ logging: env.active.logging })                      // e.g. {"logging":{"verbosity":["info"]}}
        .end();

});


module.exports = router;
