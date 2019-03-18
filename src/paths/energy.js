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
router.get('/:energy?/:period?/:epoch?/:number?', (req, res, next) => {
    
    const DEFAULT_ENERGY = def.enums.energy.hse;
    const DEFAULT_PERIOD = def.enums.period.week;
    const DEFAULT_NUMBER = 1;
    
    // validate and default all parameters 
    let energy = new params('energy', req.params.energy, def.enums.energy, DEFAULT_ENERGY);
    let period = new params('period', req.params.period, def.enums.period, DEFAULT_PERIOD);
    let num = new params('number', req.params.number, none, DEFAULT_NUMBER);

    let epoch = req.params.epoch;
    
    let site = req.query.site;

    let msg;

    epoch = (!epoch) ? 'now-epoch' : epoch;
    site = (!site) ? 'site' : site;

    msg = energy.value + ',' + period.value + ',' + epoch + ',' + num.value + ',' + site;

    res
        .status(200)
        .json({ message: msg })
        .end();
});

module.exports = router;
