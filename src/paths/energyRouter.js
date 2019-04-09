//@ts-check
"use strict";
/**
 * ./paths/EnergyGetRequest.js
 * prepares data and response for the energy path 
 */
const express = require('express');
const router = express.Router();

const Request = require('../paths');
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
        
        // request ---------------------
        let request = new Request.EnergyGetRequest(req);

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
        res
            .status(response.status)
            .type(response.contentType)
            .json({ collections });                             // no need to call .end() as .json calls end
        */ // debug END 

    });

module.exports = router;


