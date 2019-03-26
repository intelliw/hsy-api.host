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


    // call the operation to get the data objects 
    let energyOp = new EnergyOp(energy, period, site);



    // check the content type -choose the ejs template depending on the type here 

    // render the response
    let response = new Response(req, 'collections', 200);

    /* ---------------------------------
    res
        .status(200)
        .type(contentType)                                  // same as res.set('Content-Type', 'text/html')
        .render('collection', {
            p: periods, e: energy.value, s: site.value,
            v: consts.CURRENT_VERSION, h: consts.API_HOST
        });
    */

    // [debug START] =========================================================
    let periods = period.getEach();
    let msg = `${energy.value}, ${period.value}, ${period.epochInstant}, ${period.endInstant}, ${period.duration}, ${site.value}, ${response.headers.contentType}`;
    console.log(msg);
    //console.log(data.getElements());
    // let collections = []; collections.push({ 'collection': periods[0] }); collections.push({ 'collection': periods[1] });
    let collections = energyOp.collections;
    res
        .status(200)
        .type(response.headers.contentType)
        .json({ msg, collections})
        .end();
    // [debug END] ===========================================================


});

module.exports = router;
