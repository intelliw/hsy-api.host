//@ts-check
"use strict";
/**
 * ./path/energy.js
 * handlers for /energy path  
 * basepath /energy
 */
const express = require('express');
const router = express.Router();


const enums = require('../definitions/enums');
const consts = require('../definitions/constants');
const params = require('../parameters');


// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/:energy?/:period?/:epoch?/:duration?', (req, res, next) => {
    let none = global.undefined;

    // validate and default all parameters 
    let energy = new params('energy', req.params.energy, enums.energy.default, enums.energy);
    let period = new params('period', req.params.period, enums.period.default, enums.period);
    let duration = new params('duration', req.params.duration, consts.params.DEFAULT_DURATION, none);
    
    let epoch = new params.ParamTime('epoch', req.params.epoch, period.value);
        
    let site = req.query.site;
    site = (!site) ? '999' : site;

    let msg;
    msg = energy.value + ',' + period.value + ',' + epoch.value + ',' + duration.value + ',' + site;

    res
        .status(200)
        .json({ message: msg })
        .end();
});

module.exports = router;
