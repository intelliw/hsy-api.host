//@ts-check
'use strict';
/**
 * ./path/diagnostics.js
 * handlers for /api path which contains diagnostics for the api 
 * basepath /api
 */
const express = require('express');
const router = express.Router();

let consts = require('../host/constants');
let configc = require('../common/configc');

let enums = require('../host/enums');
let logging = require('../common/logging');

// [diagnostics.api.versions.get] /api/versions
router.get('/versions', (req, res, next) => {
    
    res
    .status(200)
    .json({ versions: configc.env[configc.env.active].api.versions.supported })
    .end();
    
});

// [diagnostics.api.logging.get] /api/logging?verbosity=debug,info
router.get('/logging', (req, res, next) => {
    
    // set verbosity first
    let verbosity = req.query.verbosity;                                                // e.g. ?verbosity=debug,info
    if (verbosity != consts.NONE) {
        configc.env[configc.env.active].logging.verbosity = verbosity.split(',');       // split into an array and set logging.verbosity
    }

    // return logging configuration 
    res
    .status(200)
    .json({ logging: configc.env[configc.env.active].logging })                         // e.g. {"logging":{"verbosity":["info"]}}
    .end();

});


module.exports = router;
 