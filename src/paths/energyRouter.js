//@ts-check
"use strict";
/**
 * ./paths/EnergyGet.js
 * prepares data and response for the energy path 
 */
const express = require('express');
const router = express.Router();

const utils = require('../environment/utils');
const consts = require('../host/constants');
const env = require('../environment');
const enums = env.enums;

const Request = require('./Request');
const Param = require('../parameters');

const EnergyGetResponse = require('../responses/EnergyGetResponse');



/*
'/energy' path
create parameter objects for creating the links and collections
energy, site, period -> including next/prev/parent/child periods, with durations
param objects have all the data needed for the 
[energy.period.epoch.duration.get]
 */
router.route([
    '/:energy?',
    '/:energy?/period/:period?',
    '/:energy?/period/:period?/:epoch?/:duration?'])

    .get((req, res, next) => {
        
        // request ---------------------
        let request = new EnergyGet(req);
        
        //  execute if valid
        let response = request.response;                       // execute the operation and return a response 
        let collections = response.content;
        // console.dir(collections[0].collection.links.length);      // @@@@@@
        // /* response
        res
            .status(response.statusCode)
            .type(response.contentType)
            .render(response.view, {
                collections: collections, utils: utils, consts: consts, env: env
            });

        /* // debug START
        res
            .status(response.status)
            .type(response.contentType)
            .json({ collections });                             // no need to call .end() as .json calls end
        */ // debug END 

    });


/**
 * class EnergyGetRequest validatess parameters and accept headers
 */
class EnergyGet extends Request {

    /**
     * extracts parameters and content type and calls super to validate  
     * if not valid super will create a generic error response
     * if valid this EnergyGetRequest will construct a EnergyGetResponse to produce the response content
    
     instance attributes:  
     super ..
     response : this class sets response only if super does not set it with an error
     
     constructor arguments 
    * @param {*} req                                                    // express req
    */
    constructor(req) {

        const OPTIONAL = true;
        
        // duration  - cap the number of durations for this period
        let duration = parseInt(req.params.duration) || consts.params.defaults.duration;                                     // this handles NaN being passed in as the duration,  
        let period = req.params.period;
        if (utils.valueExistsInObject(enums.params.period, period))  {
            let maxDurationsAllowed = parseInt(consts.period.maxDurationsAllowed[period]);                                   // cap the number of durations for this period
            duration = (Math.abs(duration) > maxDurationsAllowed ? maxDurationsAllowed * Math.sign(duration): duration);     // check if requested duration is negative - for periods retrospective to epoch 
        } 

        // parameters                                                   // validate and default all parameters
        let params = {};
        params.energy = new Param('energy', req.params.energy, enums.params.energy.default, enums.params.energy);
        params.period = new Param.Period(period, req.params.epoch, duration);
        params.site = new Param('site', req.query.site, consts.params.defaults.site);
        params.productCatalogItems = new Param('productCatalogItems', req.body.productCatalogItems, consts.NONE, consts.NONE, OPTIONAL);

        // The 'GET' operations in the `/energy` path does not require an API key for the default site (`site=999`)    
        let apikeyRequired = !(params.site.value == consts.params.defaults.site);               // required unless site == 999

        // cap the number of durations for this period
        let maxDurationsAllowed = Number(consts.period.maxDurationsAllowed[params.period.value]);
        params.period.duration = (params.period.duration > maxDurationsAllowed ? maxDurationsAllowed : params.period.duration);

        // super - validate params, auth, accept header
        super(req, params, EnergyGetResponse.produces, EnergyGetResponse.consumes, apikeyRequired);                 // super validates and sets this.accepts this.isValid, this.isAuthorised params valid

        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid === true ? new EnergyGetResponse(this.params, this.accept) : this.response;

    }

}


module.exports = router;


