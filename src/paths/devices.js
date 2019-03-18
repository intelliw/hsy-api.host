//@ts-check
/**
 * ./route/devices.js
 * handlers for /devices path  
 * basepath /devices
 */
const express = require('express');
const router = express.Router();

// [devices.device.dataset.post] /devices/{device}/datasets/{dataset} ---------------
router.get('/:device?/datasets/:dataset?', (req, res, next) => {

    res
        .status(200)
        .json({ message: 'devices...' })
        .end();
});

// [devices.device.config.epoch.get] /devices/{device}/config/{epoch}
router.get('/:device?/config/:epoch?', (req, res, next) => {

    res
        .status(200)
        .json({ message: 'devices...' })
        .end();
});


module.exports = router;
