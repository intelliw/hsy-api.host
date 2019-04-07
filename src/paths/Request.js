//@ts-check
"use strict";
/**
 * ./paths/Request.js
 * base class for operation classes
 *  
 */
const enums = require('../system/enums');
const utils = require('../system/utils');
const consts = require('../system/constants');

const GenericMessageDetail = require('../definitions/GenericMessageDetail');
const ErrorResponse = require('../responses/ErrorResponse');

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
     "isContentType": true if one of the accepts is supported 
     "isAuthorised": true,
     "isParamsValid" : true if all params are valid
     "isValid": true if isContent, isAuthorised, and isParamsValid
     "errors": { GenericMessageDetail }  
     "response":{Response}              // set if not valid else subclass sets it    
    
     constructor arguments 
    * @param {*} req                    // express request
    * @param {*} responseContentTypes   // list of mimetypes which this request's responder (EnergyResponder) is able to produce 
    * @param {*} params                 // list of validated params { }
    */
    constructor(req, responseContentTypes, params) {

        this.errors = new GenericMessageDetail();                                       // request errors store a detail elemeent for each validation error

        // validate params -------------------------------------------------------
        this.params = params;
        this.isParamsValid = this.validateParams(req);                                  // assign instance property e.g this.params.energy and this.params.isValid

        // validate contentype ---------------------------------------------------
        this.contentType = this.selectContentType(req, responseContentTypes);
        this.isContentType = this.validateContentType(req);

        // validate authorisation ------------------------------------------------
        this.isAuthorised = this.validateAuthorisation(req);

        // isValid --------------------------------------------------------------       // if not valid setup a generic response 
        this.isValid = this.isContentType && this.isParamsValid && this.isAuthorised;   // must have valid parameters and accept header and must be authorised

        this.response = this.isValid ? consts.NONE : new ErrorResponse(
            this.isAuthorised,
            this.isContentType,
            this.isParamsValid,
            this.errors
        );         // ErrorResponse contains a generic error message as specified by the swagger genericMessage definition

    }

    /*
     Selects an Accepts header. If an Accept header has not beem specified the default application/vnd.collection+json media type will be returned.
     If multiple Accept headers are sent the response will select one from the list of media types shown above, in the order shown.
     If the request Accept headers do not contain a type from the list above return 'undefined'
     */
    selectContentType(req, responseContentTypes) {

        let requestAcceptsType = req.accepts(responseContentTypes);        // returns false if request had Accept headers which do not match any of the responseContentTypes
        
        let contentTypeValue = (requestAcceptsType == false) ? consts.NONE : requestAcceptsType;
        console.log(`requestAcceptsType ${requestAcceptsType}`);

        return contentTypeValue;

    }

    // validate and return if params are valid. Sets error details in this.validationDetails message  
    validateParams(req) {

        const ERROR_MESSAGE = 'The client specified an invalid argument.';

        let param;

        let allValid = true;
        if (this.params) {

            let paramKeys = Object.keys(this.params);

            paramKeys.forEach(key => {                                                  // Request.isValid is true only if *all* params are valid
                param = this.params[key];

                if (!param.isValid) {                                                   // check if param was declared valid during construction 
                    this.errors.add(
                        `${ERROR_MESSAGE} | ${param.value} | ${req.path}`,
                        `parameter: ${param.name}`);                                    // add the message detail to the errors
                }
                allValid = allValid && param.isValid;
            });

        }
        return allValid;

    }

    // validate and return if authorised. Sets error details in this.validationDetails message  
    validateAuthorisation(req) {

        const ERROR_MESSAGE = 'The client does not have sufficient permission.';

        let isAuth = false;
        if (this.params) {

            let api_key = this.params[consts.API_KEY_PARAM_NAME];
            isAuth = api_key ? api_key.isValid : true;                              // 2DO: current logic allows no key as valid. in future need to call gcloud REST api to check if key is valid and has access to this API          

            if (!isAuth) {                                                          // check if param was declared valid during construction 

                this.errors.add(
                    `${ERROR_MESSAGE} | ${req.path}`,
                    `parameter: ${consts.API_KEY_PARAM_NAME}`);                     // add the message detail to the errors
            }

        }

        return isAuth;
    }

    // validate and return if content type is supported. Sets error details in this.validationDetails message  
    validateContentType(req) {

        const ERROR_MESSAGE = 'The requested Accept header type is not supported.';

        let isContentType = this.contentType != consts.NONE;                    // if content type is undefined if it was not valid

        if (!isContentType) {
            this.errors.add(
                `${ERROR_MESSAGE} | ${req.accepts()}`,
                `Accept header`);                                               // add the message detail to the errors
        }

        return isContentType;
    }


}


module.exports = Request;

