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
const host = require('../host');


// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/:energy?/periods/:period?/:epoch?/:duration?', (req, res, next) => {
    let noEnum = global.undefined;

    /*
    get the parameter objects - for creating the links and collections
    energy, site, period -> including next/prev/parent/child periods, with durations
    param objects have all the data needed for the 
     */
    // validate and default all parameters 
    let site = new Param('site', req.query.site, consts.DEFAULT_SITE);
    let energy = new Param('energy', req.params.energy, enums.energy.default, enums.energy);
    let period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);


    console.log(energy.value + ',' + period.value + ',' + period.epochInstant + ',' + period.endInstant + ',' + period.duration + ',' + site.value);

    // call the operation to get the data objects 
    let periods = period.getEach();                          // get a period array which will have one for each period in thew duration     
    let links = period.getLinks();                           // get the linked period

    // check the content type -choose the ejs template depending on the type here 
    let contentType = (req.accepts(consts.mimeTypes.textHtml)) ? consts.mimeTypes.textHtml : consts.mimeTypes.applicationCollectionJson;

    // render the response
    res
        .status(200)
        .type(contentType)                              // same as res.set('Content-Type', 'text/html')
        .render('collection', {
            p: periods, l: links, e: energy.value, s: site.value,
            v: consts.CURRENT_VERSION, h: consts.HOST_NAME
        });

});

module.exports = router;
