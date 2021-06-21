//@ts-check
'use strict';
/**
 * ./paths/DevicesDatasetsPost.js
 * handlers for /devices path  
 */
const express = require('express');
const router = express.Router();

const enums = require('../environment/enums');
const utils = require('../environment/utils');
const consts = require('../host/constants');
const log = require('../logger').log;

const Request = require('./Request');
const Param = require('../parameters');
const Datasets = require('../parameters/Datasets');

const Response = require('./Response');
const consumers = require('../consumers');

const GenericMessage = require('../definitions/GenericMessage');
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

// constants
const VIEW_PREFIX = 'message_';     // prefix for a generic response  message
const RESPONSE_STATUS = enums.responseStatus[200];

/*  [devices.dataset.pms.post]
    [devices.dataset.mppt.post]
    [devices.dataset.inverter.post]
*/
router.post('/dataset/:dataset',
    (req, res, next) => {

        // request ---------------------                                
        let request = new DevicesDatasetsPost(req);

        // trace log the response if it is not a 200 
        let response = request.response;                                // execute the operation and return a response 
        if (!utils.is200response(response.statusCode)) {
            log.trace(log.enums.labels.responseStatus, `${response.statusCode}`, JSON.stringify(items));
        }

        // send the response
        response.render(res)

    });


// REQUEST -----------------------------------------------------------------------------------------------------------

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

        let datasetName = req.params.dataset;                                                       // dataset is a query string param         
        let contentType = req.headers[enums.request.headers.contentType];                           // text/csv or application/json

        // create the consumer 
        let consumer = consumers.getConsumer(datasetName);                // apiPathIdentifier = enums.params.datasets.. the senderId is the keyname of the apikey enum (e.g. S001 for Sundaya dev and V001 for vendor dev)

        // if csv convert to json                                                                   // for text/csv req body contains raw csv content, for application/json the req.body is a 'datasets' object with array of datasets {"datasets": [.. ]                        
        let datasets = consumer.convert(
            contentType == enums.mimeType.textCsv ? `${req.body}` : req.body.datasets,              // check for csv - for text/csv this is raw csv content. use template literal to handle embedded quotes in the data !
            contentType);

        // validate the datasets                                                                     // the result is passed into the Dataset param below 
        let validationError = consumer.validate(datasets);

        // construct super Request                                                                  // this will create a Validate object and validate request params, auth, and accept header
        let params = {};
        params.dataset = new Param('dataset', datasetName, consts.NONE, enums.params.datasets);     // this is the path parameter e.g. pms
        params.datasets = new Datasets(datasetName, datasets, validationError);                     // if validationError is not '' super will reject the request

        super(req, params, DevicesDatasetsPostResponse.produces, DevicesDatasetsPostResponse.consumes);     // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        params.apiKey = this.apiKey;                                                                // add apiKey from the Request (Param.ApiKey) to the params, as it will be used to produce 'sender' attribute in Producer transform and publish

        // trace-log the request
        log.trace(log.enums.labels.requestStatus, `${datasetName} POST ${contentType}, sender:${this.senderId()}, valid?${this.validation.isValid}`, JSON.stringify({ datasets: params.datasets.value }));

        // execute the response only if super isValid                                               // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid === true ? new DevicesDatasetsPostResponse(this.params, this.accept, consumer) : this.response;

    }

}


// RESPONSE -----------------------------------------------------------------------------------------------------------

class DevicesDatasetsPostResponse extends Response {

    /**
    * posts dataset data and responds with a generic 201 response
    * constructor arguments 
      * @param {*} params                                                       // dataset, datasets, apiKey
      * @param {*} reqAcceptParam                                               // request Accepts
      * @param {*} consumerObj                                                  // the consuemr for this dataset 
    */
    constructor(params, reqAcceptParam, consumerObj) {

        let datasets = params.datasets.value;                                   // for application/json datasets param is the *array* (of datasets) in the req.body e.g.  the [.. ] array in {"datasets": [.. ] 
        let senderId = params.apiKey.senderId();

        // call the consumer (to publish asynchronously)
        consumerObj.consume(datasets, senderId);

        // prepare the response
        let message = 'Data queued for processing.';
        let description = `datasets:${consumerObj.apiPathIdentifier} | ${datasets.length}`;
        let code = utils.keynameFromValue(enums.responseStatus, RESPONSE_STATUS);
        let status = RESPONSE_STATUS;
        let response = new GenericMessage(code, status,
            new GenericMessageDetail().add(message, description).getElements());

        super(RESPONSE_STATUS, reqAcceptParam, VIEW_PREFIX, response.getElements());

    }

    // renders the response
    render(res) {

        super.render(res)
            .render(this.view, {
                collections: this.content
            });

    }

    /**
      * a list of mimetypes which this responder's request (DeviceDataPost) is able to support. 
      * the default mimetype must be the first item
      * this list must match the list specified in the 'produces' property in the openapi spec for this API 
      */
    static get produces() { return [enums.mimeType.applicationJson] };
    static get consumes() { return [enums.mimeType.applicationJson, enums.mimeType.textCsv] };

}


module.exports = router;
