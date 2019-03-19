//@ts-check
"use strict";
/**
 * ./path/energy.js
 * handlers for /energy path  
 * basepath /energy
 */
const express = require('express');
const router = express.Router();


const def = require('../definitions');
const params = require('../parameters');

const none = global.undefined;

// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/:energy?/:period?/:epoch?/:duration?', (req, res, next) => {
    
    const DEFAULT_ENERGY = def.enums.energy.hse;
    const DEFAULT_PERIOD = def.enums.period.week;
    const DEFAULT_NUMBER = 1;
    
    // validate and default all parameters 
    let energy = new params('energy', req.params.energy, def.enums.energy, DEFAULT_ENERGY);
    let period = new params('period', req.params.period, def.enums.period, DEFAULT_PERIOD);
    let duration = new params('number', req.params.duration, none, DEFAULT_NUMBER);

    let epoch = new params.ParamTime('epoch', req.params.epoch, period.value);

        
    let site = req.query.site;
    site = (!site) ? 'site' : site;

    let msg;
    msg = energy.value + ',' + period.value + ',' + epoch.value + ',' + duration.value + ',' + site;

    res
        .status(200)
        .json({ message: msg })
        .end();
});

module.exports = router;
