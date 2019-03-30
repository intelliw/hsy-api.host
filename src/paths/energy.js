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

const Response = require('../responses');
const Request = require('../operations');

// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/:energy?/periods/:period?/:epoch?/:duration?', (req, res, next) => {
    /*
    get the parameter objects - for creating the links and collections
    energy, site, period -> including next/prev/parent/child periods, with durations
    param objects have all the data needed for the 
     */
    
    // request
    let request = new Request.EnergyRequest(req.params, req.query, req.body, req.accepts());

    //  execute if valid
    let response = request.execute();                       // execute the operation and return a response 
    
    // /* ---------------------------------
    res
        .status(response.status)
        .type(response.contentType)
        .render(response.view, {
            collections: response.data
        });
    // */


    /* [debug START] =========================================================---------------------------------
    let collections = response.data;
    
    
    res
        .status(response.status)
        .type(response.contentType)
        .json({ collections })
        .end();
    */ // [debug END] ===========================================================

});

module.exports = router;
