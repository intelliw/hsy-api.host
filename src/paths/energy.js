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
    let noEnum = global.undefined;

    /**
     * get the parameter objects - for creating the links and collections
     * energy, site, period -> including next/prev/parent/child periods, with durations
     * param objects have all the data needed for the 
     */
    let site = new Param('site', req.query.site, consts.params.DEFAULT_SITE);
    let energy = new Param('energy', req.params.energy, enums.energy.default, enums.energy);
    let period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);

    //-----------[start debug]
    let msg;
    msg = energy.value + ',' + period.value + ',' + period.epochInstant + ',' + period.endInstant + ',' + period.duration + ',' + site.value;
    //-----------[end debug]

    /**
     * call the [energy.type.period.epoch.get] operation to get the data objects 
     */ 


    // render the response

    res
        .status(200)
        .json({ period: msg, message: msg })
        .end();
});

module.exports = router;
