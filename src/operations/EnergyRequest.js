//@ts-check
"use strict";
/**
 * ./operations/EnergyRequest.js
 * prepares data and response for the energy path 
 */
const enums = require('../system/enums');
const consts = require('../system/constants');
const utils = require('../system/utils');

const Definitions = require('../definitions');
const Response = require('../responses');

const Request = require('./Request');
const Param = require('../parameters');

/**
  * a list of mimetypes which this request is able to produce. 
  * the default mimetype must be the first item
  * this list must match the list specified in the 'produces' property in the openapi spec
  */
 const PRODUCES_CONTENT_TYPES = [enums.mimeTypes.applicationCollectionJson, enums.mimeTypes.applicationJson, enums.mimeTypes.textHtml, enums.mimeTypes.textPlain];

/**
 * validatess the paramters and accept header
 */
class EnergyRequest extends Request {

    //  energy period and site are all Param objects. 
    constructor(reqPath, reqQuery, reqBody, reqAccepts) {

        // parameters - validate and default 
        let energy = new Param('energy', reqPath.energy, enums.energy.default, enums.energy);
        let period = new Param.Period(reqPath.period, reqPath.epoch, reqPath.duration);
        let site = new Param('site', reqQuery.site, consts.DEFAULT_SITE);
        let api_key = new Param(consts.API_KEY_PARAM_NAME, reqQuery.api_key, consts.DEFAULT_APIKEY);
        
        // super - validate params, auth, accept header
        let params = { "energy": energy, "period": period, "site": site, "api_key": api_key };
        super(params, reqAccepts, PRODUCES_CONTENT_TYPES);                     // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        
        // execute the response if super isValid  
        this.response = this.isValid ? new Response.EnergyResponse(this.params, this.contentType) : super.response;      // super constuctor creates a generic message if the request is not valid

    }


}


module.exports = EnergyRequest;

