//@ts-check
"use strict";
/**
 * ./operations/EnergyRequest.js
 * prepares data and response for the energy path 
 */
const enums = require('../system/enums');
const consts = require('../system/constants');

const Response = require('../responses');
const EnergyResponse = require('../responses/EnergyResponse');

const Request = require('./Request');
const Param = require('../parameters');

/**
 * validatess the paramters and accept header
 */
class EnergyRequest extends Request {

    /**
     * extracts parameters and content type and calls super to validate  
     * if not valid super will create a generic error response
     * if valid this EnergyRequest will construct a EnergyResponse to produce the response content
    
     instance attributes:  
     super ..
     response : set if super does not set it                            
    
     constructor arguments 
    * @param {*} req                    // express req
    */
    constructor(req) {

        let reqPathParams = req.params;
        let reqQueryParams = req.query;
        let reqBodyParams = req.body;

        // parameters                                                   // validate and default 
        let energy = new Param('energy', reqPathParams.energy, enums.energy.default, enums.energy);
        let period = new Param.Period(reqPathParams.period, reqPathParams.epoch, reqPathParams.duration);
        let site = new Param('site', reqQueryParams.site, consts.DEFAULT_SITE);
        let api_key = new Param(consts.API_KEY_PARAM_NAME, reqQueryParams.api_key, consts.DEFAULT_APIKEY);
        //
        let params = { "energy": energy, "period": period, "site": site, "api_key": api_key };

        // contentType
        let responseContentTypes = EnergyResponse.produces;             // list of mimetypes which this request's responder (EnergyResponder) is able to produce 
        let contentType = Request.selectContentType(req, responseContentTypes);

        // super - validate params, auth, accept header
        super(params, contentType);                                     // super validates and sets this.accepts this.isValid, this.isAuthorised params valid

        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = GenericResponse 
        
        if (this.isValid) {
            this.response = new Response.EnergyResponse(this.params, this.contentType);
        }

    }

}


module.exports = EnergyRequest;

