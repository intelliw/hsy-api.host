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
const host = require('../host');


// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/:energy?/periods/:period?/:epoch?/:duration?', (req, res, next) => {
    let noEnum = global.undefined;

    /**
     * get the parameter objects - for creating the links and collections
     * energy, site, period -> including next/prev/parent/child periods, with durations
     * param objects have all the data needed for the 
     */
    // validate and default all parameters 
    let site = new Param('site', req.query.site, consts.params.DEFAULT_SITE);
    let energy = new Param('energy', req.params.energy, enums.energy.default, enums.energy);
    let period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);

    // check the content type -choose the ejs template here 
    let contentType = (req.accepts(consts.mimeTypes.textHtml)) ? consts.mimeTypes.textHtml : consts.mimeTypes.applicationCollectionJson;

    console.log(energy.value + ',' + period.value + ',' + period.epochInstant + ',' + period.endInstant + ',' + period.duration + ',' + site.value);
    //-----------[start debug]
    /**
        let msg;
        msg = energy.value + ',' + period.value + ',' + period.epochInstant + ',' + period.endInstant + ',' + period.duration + ',' + site.value;
        */
    //-----------[end debug]

    /**
     * call the operation to get the data objects 
     */


    // render the response
    res
        .status(200)
        .type(contentType)                              // same as res.set('Content-Type', 'text/html')
        .render('energy', { host: consts.sys.HOST_NAME, site: site, energy: energy, period: period });


    /**
     * res
        .status(200)
        .type(contentType)                              // same as res.set('Content-Type', 'text/html')
        .render('energy', { user: 'Any User?', title: 'homepage'});
     */

});

module.exports = router;
