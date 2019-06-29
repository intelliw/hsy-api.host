//@ts-check
"use strict";
/**
 * ./requests/DatasetsPostRequest.js
 * prepares data and response for the devices datasets post path 
 */
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
        
        // there are no parameters                                      // validate and default all datasets
        let params = {};                                                // there are no params for this request

        // create a Dataset object for each datasets in the request                            // validate and default all datasets
        let datasets = [];
        let key, topic, datasetItems;
        req.body.deviceDatasets.forEach(dataset => {
            key = dataset.device;                                           // deviceId e.g. "BBC-PR1202-999" - this is the message key for all dataitems in this dataset
            topic = dataset.topic;                                          // e.g. "MPPTSNMP" - the message key for all dataitems in this dataset 
            datasetItems = dataset.dataset;                                 // [ ] array of data items
            //
            datasets.push(new Param.Dataset(key, topic, datasetItems));     // adds processingTime to each dataitem 
        });

        // super - validate params, auth, accept header
        super(req, params, DatasetsPostResponse.produces, DatasetsPostResponse.consumes, datasets);     // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        
        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid ? new Response.DevicesDatasetsPostResponse(this.params, this.accept) : this.response;
        
    }

}


module.exports = DevicesDatasetsPost;


