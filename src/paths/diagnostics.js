//@ts-check
/**
 * ./path/diagnostics.js
 * handlers for /api path which contains diagnostics for the api 
 * basepath /api
 */
const express = require('express');
const router = express.Router();

let def = require('../definitions');

// [diagnostics.api.versions.get] /api/versions
router.get('/versions', (req, res, next) => {

    res
    .status(200)
    .json({ versions: def.constants.sys.ACTIVE_VERSIONS })
    .end();

});

module.exports = router;
