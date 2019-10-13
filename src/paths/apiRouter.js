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
let enums = require('../host/enums');
let logger = require('../common/logger');

// [diagnostics.api.versions.get] /api/versions
router.get('/versions', (req, res, next) => {
    
    res
    .status(200)
    .json({ versions: consts.api.versions.supported })
    .end();

    logger.verbosity = [enums.verbosity.info, enums.verbosity.debug];

});

// [diagnostics.api.logger.get] /api/logger?verbosity=debug,info
router.get('/logger', (req, res, next) => {
    
    // set verbosity
    let verbosity = req.query.verbosity;                                    // e.g. ?verbosity=debug,info
    if (verbosity != consts.NONE) {
        logger.verbosity = verbosity.split(',');                            // split into an array and set logger.verbosity
    }

    // return logger  
    res
    .status(200)
    .json({ logger })                                                       // e.g. {"logger":{"verbosity":["info"]}}
    .end();

});


module.exports = router;
 