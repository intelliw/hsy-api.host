//@ts-check
"use strict";
/**
 * ./requests/Request.js
 * base class for operation classes
 *  
 */
const enums = require('../host/enums');
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
     "apiKey": AIzaSyASFQxf4PmOutVS1Dt99TPcZ4IQ8PDUMqY 
     "accept": Param.Accept  defaults to first value in response.produces, or undefined if req.accepts is provided and not supported by the response
     "contentType": Param.ContentType  defaults to response.consumes, or undefined if req['content-type'] is provided and not supported by the response
     "validation": {
        "isValid": true if isAcceptTypeValid, isAuthorised, and isParamsValid
        "isAcceptTypeValid": true if a mimetypes in an Accepts header is supported 
        "isContentTypeValid": true if the mimetypes in the Content-Type header is supported 
        "isAuthorised": true,
        "isParamsValid" : true if all params are valid
        "errors": { GenericMessageDetail }  
     }  
     "response":{Response}              // set if not valid else subclass sets it    
    
     constructor arguments 
    * @param {*} req                    // express request
    * @param {*} responseProduces   // list of mimetypes which this request's responder (EnergyResponder) is able to produce 
    * @param {*} params                 // list of validated params { }
    */
    constructor(req, params, responseProduces, responseConsumes) {

        // update instance properties before validation 
        this.params = params;
        this.apiKey = new Param(consts.API_KEY_PARAM_NAME, req.headers[consts.API_KEY_PARAM_NAME], enums.apiKey.default, enums.apiKey);
        this.accept = new Param.Accept(req, responseProduces);
        this.contentType = new Param.ContentType(req, responseConsumes);

        //validate                                                                          // validates.. this.params, this.apikey, and this.accept
        this.validation = this.validate(req);

        // response
        this.response = this.validation.isValid ? consts.NONE : new ErrorResponse(this.validation);       // ErrorResponse contains a generic error message as specified by the swagger genericMessage definition

    }

    // validates request and return a validation object 
    validate(req) {

        // // create validation object 
        let validation = { "isValid": false, "errors": new GenericMessageDetail() };        // validation.errors store a detail elemeent for each validation error                

        // validate authorisation 
        validation = validateAuthorisation(req, this.apiKey, validation);                   // updates validation.errors and validation.isAuthorised

        // validate accept Type 
        validation = validateAcceptType(req, this.accept, validation);                      // updates validation.errors and validation.isAcceptTypeValid

        // validate content-type 
        validation = validateContentType(req, this.contentType, validation);                // updates validation.errors and validation.isContentTypeValid

        // validate params 
        validation = validateParams(req, this.params, validation);                          // updates validation.errors and validation.isParamsValid

        // summarise and rteturn validation                                                 // must have valid parameters and accept header and must be authorised
        validation.isValid = validation.isAcceptTypeValid 
                    && validation.isContentTypeValid
                    && validation.isParamsValid 
                    && validation.isAuthorised;   

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

// validate content type and returns validation.isContentTypeValid. Provides error details in validation.errors
function validateContentType(req, contentTypeParam, validation) {

    const ERROR_MESSAGE = 'The requested Content-Type is not supported.';
    const CONTENT_TYPE_HEADER = 'content-type';

    let isContentTypeValid = contentTypeParam.isValid;                                     // if content type is undefined if it was not valid

    if (!isContentTypeValid) {
        validation.errors.add(
            `${ERROR_MESSAGE} | ${req.headers[CONTENT_TYPE_HEADER]}`,
            `Content-Type header`);                                                       // add the message detail to the errors
    }

    validation.isContentTypeValid = isContentTypeValid
    return validation;
}

// validate accept type and return validation.isAcceptTypeValid. Provides error details in validation.errors
function validateAcceptType(req, acceptParam, validation) {

    const ERROR_MESSAGE = 'The requested Accept type is not supported.';

    let isAcceptTypeValid = acceptParam.isValid;                                     // if content type is undefined if it was not valid

    if (!isAcceptTypeValid) {
        validation.errors.add(
            `${ERROR_MESSAGE} | ${req.accepts()}`,
            `Accept header`);                                                       // add the message detail to the errors
    }

    validation.isAcceptTypeValid = isAcceptTypeValid
    return validation;
}

// validate if authorised and return validation.isAuthorised. Provides error details in validation.errors
function validateAuthorisation(req, apiKeyParam, validation) {

    const ERROR_MESSAGE = 'The client does not have sufficient permission.';

    let isAuth = false;                                                             // 2DO: current logic allows no key as valid. in future need to call gcloud REST api to check if key is valid and has access to this API          
    if (apiKeyParam) {

        isAuth = apiKeyParam.value ? apiKeyParam.isValid : true;                    // if apiKey is missing defaults to true for now 

        if (!isAuth) {                                                              // check if param was declared valid during construction 

            validation.errors.add(
                `${ERROR_MESSAGE} | ${apiKeyParam.value} | ${req.url}`,
                `parameter: ${apiKeyParam.name}`);                                       // add the message detail to the errors
        }

    }

    validation.isAuthorised = isAuth;

    return validation;
}

module.exports = Request;

