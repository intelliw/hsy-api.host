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
const Param = require('../parameters');


// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/:energy?/:period?/:epoch?/:duration?', (req, res, next) => {
    let none = global.undefined;

    // validate and default all parameters 
    let energy = new Param('energy', req.params.energy, enums.energy.default, enums.energy);
    let period = new Param.Period(req.params.period, req.params.epoch);
    let duration = new Param('duration', req.params.duration, consts.params.DEFAULT_DURATION, none);
    let site = new Param('site', req.query.site, consts.params.DEFAULT_SITE);    
 
    let msg;
    msg = energy.value + ',' + period.value + ',' + period.epoch + ',' + period.end + ',' + duration.value + ',' + site.value;

    res
        .status(200)
        .json({ message: msg })
        .end();
});

module.exports = router;
