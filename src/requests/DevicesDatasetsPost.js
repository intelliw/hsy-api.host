//@ts-check
"use strict";
/**
 * ./requests/DatasetsPostRequest.js
 * prepares data and response for the devices datasets post path 
 */
const enums = require('../host/enums');

const Response = require('../responses');
const DatasetsPostResponse = require('../responses/DevicesDatasetsPostResponse');

const Request = require('./Request');
const Param = require('../parameters');

/**
 * 
 */
class DevicesDatasetsPost extends Request {

    /**
     * extracts parameters and content type and calls super to validate  
     * if not valid super will create a generic error response
     * if valid this class will construct a DatasetsPostResponse to produce the response content
    
     instance attributes:  
     super ..
     response : this class sets response only if super does not set it with an error
    
     constructor arguments 
    * @param {*} req                                                    // express req
    */
    constructor(req) {
        
        // parameters                                                   // validate and default all parameters
        let params = {};
        params.deviceDatasetItems = new Param('deviceDatasetItems', req.body.deviceDatasetItems);
        
        // super - validate params, auth, accept header
        super(req, params, DatasetsPostResponse.produces, DatasetsPostResponse.consumes);                    // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        
        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid ? new Response.DevicesDatasetsPostResponse(this.params, this.accept) : this.response;
        
    }

}


module.exports = DevicesDatasetsPost;


