//@ts-check
'use strict';
/**
 * ./path/diagnostics.js
 * handlers for /api path which contains diagnostics for the api 
 * basepath /api
 */
const express = require('express');
const router = express.Router();

const env = require('../host/environments');

let enums = require('../host/enums');
let log = require('../host/log');

const NONE = global.undefined;

// [diagnostics.api.versions.get] /api/versions
router.get('/versions', (req, res, next) => {
    
    res
    .status(200)
    .json({ versions: env.active.api.versions.supported })
    .end();
    
});

// [diagnostics.api.logging.get] /api/logging?verbosity=debug,info
router.get('/logging', (req, res, next) => {
    
    // set verbosity first
    let verbosity = req.query.verbosity;                                                // e.g. ?verbosity=debug,info
    if (verbosity != NONE) {
        env.active.logging.verbosity = verbosity.split(',');       // split into an array and set logging.verbosity
    }

    // return logging configuration 
    res
    .status(200)
    .json({ logging: env.active.logging })                         // e.g. {"logging":{"verbosity":["info"]}}
    .end();

});


module.exports = router;
 