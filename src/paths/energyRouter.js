//@ts-check
"use strict";
/**
 * ./requests/EnergyGetRequest.js
 * prepares data and response for the energy path 
 */
const express = require('express');
const router = express.Router();

const Request = require('../requests');
/*
'/energy' path
create parameter objects for creating the links and collections
energy, site, period -> including next/prev/parent/child periods, with durations
param objects have all the data needed for the 
[energy.period.epoch.duration.get]
 */
router.get(['/',
    '/:energy?',
    '/:energy?/period/:period?',
    '/:energy?/period/:period?/:epoch?/:duration?'], (req, res, next) => {
        
        // request ---------------------
        let request = new Request.EnergyGet(req);
        
        //  execute if valid
        let response = request.response;                       // execute the operation and return a response 
        let collections = response.content;
        
        
        // /* response
        res
            .status(response.statusCode)
            .type(response.contentType)
            .render(response.view, {
                collections: collections
            });
        // */ // 
        
        /* // debug START
        // console.log(` ${}`);
        console.log(` ${JSON.stringify()}`);
        res
            .status(response.status)
            .type(response.contentType)
            .json({ collections });                             // no need to call .end() as .json calls end
        */ // debug END 

    });

module.exports = router;


