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
const def = require('../definitions');
const utils = require('../system/utils');



// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/:energy?/periods/:period?/:epoch?/:duration?', (req, res, next) => {
    let noEnum = global.undefined;

    /*
    get the parameter objects - for creating the links and collections
    energy, site, period -> including next/prev/parent/child periods, with durations
    param objects have all the data needed for the 
     */
    // validate and default all parameters ( the Param constructor is name, value, default, enum)
    let site = new Param('site', req.query.site, consts.DEFAULT_SITE);
    let energy = new Param('energy', req.params.energy, enums.energy.default, enums.energy);
    let period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);
    let contentType = new Param('contentType', utils.selectHeader(req.accepts()), enums.mimeTypes.applicationCollectionJson, enums.mimeTypes);

    // call the operation to get the data objects 
    let periods = period.getEach();                         // get a period array which will have an individual item for each period in the duration
    let data = new def.EnergyData(energy, period);

    // check the content type -choose the ejs template depending on the type here 
    

    //console.log(periods[0].children()[0].data()[0].name);

    // render the response
    /*
    res
        .status(200)
        .type(contentType)                              // same as res.set('Content-Type', 'text/html')
        .render('collection', {
            p: periods, e: energy.value, s: site.value,
            v: consts.CURRENT_VERSION, h: consts.HOST_NAME
        });
    */

    let msg = energy.value + ',' + period.value + ',' + period.epochInstant + ',' + period.endInstant + ',' + period.duration + ',' + site.value;
    console.log(msg);
    let collections = [];
    collections.push({'collection': periods[0]});
    collections.push({'collection': periods[1]});
    res
        .status(200)
        .type(contentType.value)
        .json({msg, collections})
        .end();


});

module.exports = router;
