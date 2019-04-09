//@ts-check
"use strict";
/**
 * ./paths/Request.js
 * base class for operation classes
 *  
 */
const enums = require('../host/enums');
const utils = require('../host/utils');
const consts = require('../host/constants');

const GenericMessageDetail = require('../definitions/GenericMessageDetail');
const ErrorResponse = require('../responses/ErrorResponse');
const Param = require('../parameters');

/**
* stores data and status for an operation in a Response object, and the headers
*/
class Request {

    /**
     * base constructor validates params and checks authorisation
     * selects an Accept header based on the content types supported by the response 
    
     instance attributes:  
     "params": { Param }
     "contentType": enums.mimeTypes.applicationJson, or undefined if req.accepts are not supported 
     "apiKey": AIzaSyASFQxf4PmOutVS1Dt99TPcZ4IQ8PDUMqY 
     "validation": {
        "isValid": true if isTypeValid, isAuthorised, and isParamsValid
        "isTypeValid": true if a mimetypes in an Accepts header is supported 
        "isAuthorised": true,
        "isParamsValid" : true if all params are valid
        "errors": { GenericMessageDetail }  
     }  
     "response":{Response}              // set if not valid else subclass sets it    
    
     constructor arguments 
    * @param {*} req                    // express request
    * @param {*} responseContentTypes   // list of mimetypes which this request's responder (EnergyResponder) is able to produce 
    * @param {*} params                 // list of validated params { }
    */
    constructor(req, params, responseContentTypes) {

        this.params = params;
        this.apiKey = new Param(consts.API_KEY_PARAM_NAME, req.query[consts.API_KEY_PARAM_NAME], enums.apiKey.default, enums.apiKey);
        
        this.contentType = selectContentType(req, responseContentTypes);
        
        this.validation = this.validate(req, this.params, this.apiKey, this.contentType, responseContentTypes);
        
        // response
        this.response = this.validation.isValid ? consts.NONE : new ErrorResponse(this.validation);       // ErrorResponse contains a generic error message as specified by the swagger genericMessage definition

    }

    // validates request and returns a validation object 
    validate(req, params, apiKey, contentType, responseContentTypes) {


        this.errors = new GenericMessageDetail();                                       // request errors store a detail elemeent for each validation error
        let validation = { "isValid": false, "errors": this.errors };

        // validate authorisation 
        validation = validateAuthorisation(req, apiKey, validation);                    // updates validation.errors and validation.isAuthorised
        
        // validate contentype 
        validation = validateContentType(req, this.contentType, validation);            // updates validation.errors and validation.isTypeValid

        // validate params 
        validation = validateParams(req, params, validation);                      // updates validation.errors and validation.isParamsValid

        // summarise and rteturn validation  
        validation.isValid = validation.isTypeValid && validation.isParamsValid && validation.isAuthorised;   // must have valid parameters and accept header and must be authorised
        
        return validation;
    }

}

// validate params and return validation.isParamsValid. Provides error details in validation.errors    
function validateParams(req, params, validation) {

    const ERROR_MESSAGE = 'The client specified an invalid argument.';

    let param;

    let allValid = true;
    if (params) {

        let paramKeys = Object.keys(params);

        paramKeys.forEach(key => {                                                  // Request.isValid is true only if *all* params are valid
            param = params[key];

            if (!param.isValid) {                                                   // check if param was declared valid during construction 
                validation.errors.add(
                    `${ERROR_MESSAGE} | ${param.value} | ${req.path}`,
                    `parameter: ${param.name}`);                                    // add the message detail to the errors
            }
            allValid = allValid && param.isValid;
        });

    }

    validation.isParamsValid = allValid;
    return validation;

}

// validate content type and return validation.isTypeValid. Provides error details in validation.errors
function validateContentType(req, contentType, validation) {

    const ERROR_MESSAGE = 'The requested Accept header type is not supported.';

    let isTypeValid = contentType != consts.NONE;                                 // if content type is undefined if it was not valid

    if (!isTypeValid) {
        validation.errors.add(
            `${ERROR_MESSAGE} | ${req.accepts()}`,
            `Accept header`);                                                       // add the message detail to the errors
    }

    validation.isTypeValid = isTypeValid
    return validation;
}

/*
 Selects an Accepts header. If an Accept header has not beem specified the default application/vnd.collection+json media type will be returned.
 If multiple Accept headers are sent the response will select one from the list of media types shown above, in the order shown.
 If the request Accept headers do not contain a type from the list above return 'undefined'
 */
function selectContentType(req, responseContentTypes) {

    let requestAcceptsType = req.accepts(responseContentTypes);                     // returns false if request had Accept headers which do not match any of the responseContentTypes

    let contentTypeValue = (requestAcceptsType == false) ? consts.NONE : requestAcceptsType;

    return contentTypeValue;

}

// validate if authorised and return validation.isAuthorised. Provides error details in validation.errors
function validateAuthorisation(req, apiKey, validation) {

    const ERROR_MESSAGE = 'The client does not have sufficient permission.';

    let isAuth = false;                                                         // 2DO: current logic allows no key as valid. in future need to call gcloud REST api to check if key is valid and has access to this API          
    if (apiKey) {

        isAuth = apiKey ? apiKey.isValid : true;                                

        if (!isAuth) {                                                          // check if param was declared valid during construction 

            validation.errors.add(
                `${ERROR_MESSAGE} | ${apiKey.value} | ${req.url}`,
                `parameter: ${apiKey.name}`);                                   // add the message detail to the errors
        }

    }

    validation.isAuthorised = isAuth;
    
    return validation;
}

module.exports = Request;

