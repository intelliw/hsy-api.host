//@ts-check
"use strict";
/**
 * ./path/energy.js
 * handlers for the /energy path  
 * basepath in the route manager (app.js) should be /energy
 */
const express = require('express');
const router = express.Router();


const enums = require('../system/enums');
const consts = require('../system/constants');

const Param = require('../parameters');
const Response = require('../responses');
const EnergyOp = require('../operations/EnergyOp');

// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/:energy?/periods/:period?/:epoch?/:duration?', (req, res, next) => {
    /*
    get the parameter objects - for creating the links and collections
    energy, site, period -> including next/prev/parent/child periods, with durations
    param objects have all the data needed for the 
     */
    // validate and default request parameters and headers (btw Param constructor is name, value, default, enum)
    let energy = new Param('energy', req.params.energy, enums.energy.default, enums.energy);
    let period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);
    let site = new Param('site', req.query.site, consts.DEFAULT_SITE);

    // call the operation to get the data, also passing in the accepts headers which will be used to rdecide on a view  
    let energyOp = new EnergyOp(energy, period, site, req.accepts());
    let response = energyOp.response;
    
    
    // console.log(response.headers.contentType);
    // console.log(response.data[0].collection.items[0]);
    
    // /* ---------------------------------
    res
        .status(response.status)
        .type(response.headers.contentType)
        .render(response.view, {
            collections: response.data
        });
    // */


    /* [debug START] =========================================================---------------------------------
    console.log(`${energy.value}, ${period.value}, ${period.epochInstant}, ${period.endInstant}, ${period.duration}, ${site.value}, ${response.headers.contentType}`);
    let collections = response.data;
    res
        .status(response.status)
        .type(response.headers.contentType)
        .json({ collections })
        .end();
    */ // [debug END] ===========================================================

});

module.exports = router;
