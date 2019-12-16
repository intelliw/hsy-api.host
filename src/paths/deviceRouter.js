//@ts-check
'use strict';
/**
 * handlers for /device path  
 */
const express = require('express');
const router = express.Router();

const enums = require('../environment/enums');
const consts = require('../host/constants');
const utils = require('../environment/utils');

const Request = require('./Request');
const Param = require('../parameters');

const Response = require('./Response');
const GenericMessage = require('../definitions/GenericMessage');
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

// REQUEST constants
const VIEW_PREFIX = 'message_';         // prefix for a generic response message 
const RESPONSE_STATUS = enums.responseStatus[200];


/* [device.dataset.period.epoch.duration.get]
    Returns device data for a period. 
    BTW     :XXX means it's a URL parameter. (i.e. req.params.XXX)
            ? means that the parameter is optional
*/
router.get(['/:device?/dataset/:dataset?',
    '/:device?/dataset/:dataset?/period/:period?',
    '/:device?/dataset/:dataset?/period/:period?/:epoch?/:duration?'],
    (req, res, next) => {

        // request ---------------------
        let request = new DeviceDatasetGet(req);

        //  execute if valid
        let response = request.response;                            // execute the operation and return a response 
        let items = response.content;

        // response
        res
            .status(response.statusCode)
            .type(response.contentType)
            .render(response.view, {
                collections: items
            });

    });


/* [devices.device.config.epoch.get] /devices/{device}/config/{epoch}
    Returns historical configuration data for a period, including identifiers of subitems 
    such as battery assembly, MCU board, and Mosfet board.
*/
router.get('/:device?/config/:epoch?', (req, res, next) => {

    res
        .status(200)
        .json({ message: 'devices/config...' })
        .end();
});


// REQUEST -----------------------------------------------------------------------------------------------------------

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
        params.dataset = new Param('dataset', req.params.dataset, consts.NONE, enums.params.datasets);
        params.period = new Param.Period(req.params.period, req.params.epoch, req.params.duration);

        // super - validate params, auth, accept header
        super(req, params, DeviceDatasetGetResponse.produces, DeviceDatasetGetResponse.consumes);                    // super validates and sets this.accepts this.isValid, this.isAuthorised params valid

        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid === true ? new DeviceDatasetGetResponse(this.params, this.accept) : this.response;

    }

}


// RESPONSE -----------------------------------------------------------------------------------------------------------

class DeviceDatasetGetResponse extends Response {

    /**
    * posts dataset data and responds with a generic 201 response
    */
    constructor(params, reqAcceptParam) {

        let content = executeGet(params);

        super(RESPONSE_STATUS, reqAcceptParam, VIEW_PREFIX, content);

    }

    /**
      * a list of mimetypes which this responder's request (DeviceDataPost) is able to support. 
      * the default mimetype must be the first item
      * this list must match the list specified in the 'produces' property in the openapi spec
      */
    static get produces() { return [enums.mimeType.applicationJson] };
    static get consumes() { return [enums.mimeType.applicationJson] };

}

// perform the data operation 
function executeGet(params) {

    let content = "";   // 2DO

    let statusCode = utils.keynameFromValue(enums.responseStatus, RESPONSE_STATUS);
    let response = new GenericMessage(statusCode, RESPONSE_STATUS,
        new GenericMessageDetail().add('datasets retrieved', `device:${params.device.value} | dataset:${params.dataset.value}`).getElements());

    return response.getElements();
}


module.exports = router;
