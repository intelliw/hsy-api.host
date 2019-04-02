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

/*
'/energy' path
create parameter objects for creating the links and collections
energy, site, period -> including next/prev/parent/child periods, with durations
param objects have all the data needed for the 
 */
router.get(['/',
    '/:energy?',
    '/:energy?/periods/:period?',
    '/:energy?/periods/:period?/:epoch?/:duration?'], (req, res, next) => {

        // request
        let request = new Request.EnergyRequest(req.params, req.query, req.body, req.accepts());

        //  execute if valid
        let response = request.execute();                       // execute the operation and return a response 
        let collections = response.content;
        //let collections = JSON.stringify(response.content, replacer, 2);
        // console.log(collections); 


        // /* =======================================================================
        res
            .status(response.status)
            .type(response.contentType)
            .render(response.view, {
                collections: collections
            });

        // */ // =======================================================================


        /* [debug START] ============================================================
        // console.log(`${}`);
        res
            .status(response.status)
            .type(response.contentType)
            .json({ collections });                     // no need to call .end() as .json calls end
    
        */ // [debug END] ===========================================================

    });

module.exports = router;
