//@ts-check
"use strict";
/**
 * ./paths/DatasetsPostRequest.js
 * prepares data and response for the devices datasets post path 
 */
const enums = require('../host/enums');
const consts = require('../host/constants');

const Response = require('../responses');
const DatasetsPostResponse = require('../responses/DevicesDatasetsPostResponse');

const Request = require('./Request');
const Param = require('../parameters');

/**
 * 
 */
class DeviceDatasetGet extends Request {

    /**
     * extracts parameters and content type and calls super to validate  
     * if not valid super will create a generic error response
     * if valid this class will construct a DatasetsPostResponse to produce the response content
    
     instance attributes:  
     super ..
     response : set byu thgis class only if super does not set it 
    
     constructor arguments 
    * @param {*} req                                                    // express req
    */
    constructor(req) {

        // parameters                                                   // validate and default all parameters
        let device = new Param('device', req.params.device);
        let dataset = new Param('dataset', req.params.dataset, enums.datasets);
        let period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);
        
        let params = { "device": device, "dataset": dataset, "period": period };
        
        // super - validate params, auth, accept header
        let responseContentTypes = DatasetsPostResponse.produces;
        super(req, params, responseContentTypes);                    // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        
        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid ? new Response.DeviceDatasetGetResponse(this.params, this.contentType) : this.response;
        
    }

}


module.exports = DeviceDatasetGet;


