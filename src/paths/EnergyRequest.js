//@ts-check
"use strict";
/**
 * ./paths/EnergyRequest.js
 * prepares data and response for the energy path 
 */
const express = require('express');
const router = express.Router();

const enums = require('../system/enums');
const consts = require('../system/constants');

const Response = require('../responses');
const EnergyResponse = require('../responses/EnergyResponse');

const Request = require('../paths');
const Param = require('../parameters');

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
        let request = new EnergyRequest(req);

        //  execute if valid
        let response = request.response;                       // execute the operation and return a response 
        let collections = response.content;


        // response
        // /* =======================================================================
        res
            .status(response.statusCode)
            .type(response.contentType)
            .render(response.view, {
                collections: collections
            });
        // */ // =======================================================================
        /* // [debug START] ============================================================
        // console.log(` ${}`);
        res
            .status(response.status)
            .type(response.contentType)
            .json({ collections });                             // no need to call .end() as .json calls end
        */ // [debug END] ===========================================================

    });


/**
 * class EnergyRequest validatess parameters and accept headers
 */
class EnergyRequest extends Request {

    /**
     * extracts parameters and content type and calls super to validate  
     * if not valid super will create a generic error response
     * if valid this EnergyRequest will construct a EnergyResponse to produce the response content
    
     instance attributes:  
     super ..
     response : set only if super does not set it 
    
     constructor arguments 
    * @param {*} req                                                    // express req
    */
    constructor(req) {

        let pathParams = req.params;
        let queryParams = req.query;
        let bodyParams = req.body;

        // parameters                                                   // validate and default 
        let energy = new Param('energy', pathParams.energy, enums.energy.default, enums.energy);
        let period = new Param.Period(pathParams.period, pathParams.epoch, pathParams.duration);
        let site = new Param('site', queryParams.site, consts.DEFAULT_SITE);
        let api_key = new Param(consts.API_KEY_PARAM_NAME, queryParams.api_key, consts.DEFAULT_APIKEY);
        //
        let params = { "energy": energy, "period": period, "site": site, "api_key": api_key };

        // super - validate params, auth, accept header
        super(req, EnergyResponse.produces, params);  // super validates and sets this.accepts this.isValid, this.isAuthorised params valid

        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 

        if (this.isValid) {
            this.response = new Response.EnergyResponse(this.params, this.contentType);
        }

    }

}


module.exports = router;


