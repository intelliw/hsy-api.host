/**
 * ./path/energy.js
 * handlers for /energy path  
 */
const express = require('express');
const router = express.Router();

let def = require('../definitions');

// API ROUTE [diagnostics.versions.get] /versions ---------------------------------
router.get('/', (req, res, next) => {

    res
    .status(200)
    .json({ versions: def.constant.SUPPORTED_VERSIONS })
    .end();

});

module.exports.router = router;
