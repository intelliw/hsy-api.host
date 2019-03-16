/**
 * ./route/energy.js
 * handlers for /energy path  
 */
const express = require('express');
const router = express.Router();

// API ROUTE [devices.datasets.post] /devices/{device}/datasets/{dataset} ---------------
router.get('/:device?/datasets/:dataset?', (req, res, next) => {

    res
        .status(200)
        .json({ message: 'devices...' })
        .end();
});

module.exports.router = router;
