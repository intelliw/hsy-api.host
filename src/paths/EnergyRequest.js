//@ts-check
"use strict";
/**
 * ./paths/EnergyRequest.js
 * prepares data and response for the energy path 
 */
const enums = require('../host/enums');
const consts = require('../host/constants');

const Response = require('../responses');
const EnergyResponse = require('../responses/EnergyResponse');

const Request = require('../paths/Request');
const Param = require('../parameters');

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
     response : set byu thgis class only if super does not set it 
    
     constructor arguments 
    * @param {*} req                                                    // express req
    */
    constructor(req) {

        // parameters                                                   // validate and default all parameters
        let energy = new Param('energy', req.params.energy, enums.energy.default, enums.energy);
        let period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);
        let site = new Param('site', req.query.site, consts.DEFAULT_SITE);
        
        let params = { "energy": energy, "period": period, "site": site };

        // super - validate params, auth, accept header
        let responseContentTypes = EnergyResponse.produces;
        super(req, params, responseContentTypes);                    // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        
        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid ? new Response.EnergyResponse(this.params, this.contentType) : this.response;
        
    }

}


module.exports = EnergyRequest;


