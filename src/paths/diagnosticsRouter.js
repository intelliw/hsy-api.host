//@ts-check
/**
 * ./path/diagnostics.js
 * handlers for /api path which contains diagnostics for the api 
 * basepath /api
 */
const express = require('express');
const router = express.Router();

let consts = require('../host/constants');

// [diagnostics.api.versions.get] /api/versions
router.get('/versions', (req, res, next) => {

    res
    .status(200)
    .json({ versions: consts.ACTIVE_VERSIONS })
    .end();

});

module.exports = router;
 