//@ts-check
"use strict";
/**
 * ./requests/DatasetsPostRequest.js
 * prepares data and response for the devices datasets post path 
 */
const enums = require('../host/enums');

const Response = require('../responses');
const DatasetGetResponse = require('../responses/DeviceDatasetGetResponse');

const Request = require('./Request');
const Param = require('../parameters');

const NONE = global.undefined;

/**
 * 
 */
class DeviceDatasetGet extends Request {

    /**
     * extracts parameters and content type and calls super to validate  
     * if not valid super will create a generic error response
     * if valid this class will construct a DatasetGetResponse to produce the response content
    
     instance attributes:  
     super ..
     response : this class sets response only if super does not set it with an error
    
     constructor arguments 
    * @param {*} req                                                    // express req
    */
    constructor(req) {
        
        // parameters                                                   // validate and default all parameters
        let params = {};
        params.device = new Param('device', req.params.device);
        params.dataset = new Param('dataset', req.params.dataset, NONE, enums.params.datasets);
        params.period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);
        
        // super - validate params, auth, accept header
        super(req, params, DatasetGetResponse.produces, DatasetGetResponse.consumes);                    // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        
        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid  === true ? new Response.DeviceDatasetGetResponse(this.params, this.accept) : this.response;
        
    }

}


module.exports = DeviceDatasetGet;


