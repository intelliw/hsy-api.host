//@ts-check
"use strict";
/**
 * ./operations/Op.js
 * base class for operation classes
 *  
 */
const enums = require('../system/enums');
const utils = require('../system/utils');
const consts = require('../system/constants');

const GenericResponse = require('../responses/GenericResponse');

/**
* stores data and status for an operation in a Response object, and the headers
*/
class Request {

    /**
     * base constructor validates params and checks authorisation
     * selects an Accept header based on the content types supported by the response 
    
     instance attributes:  
     "params": { .. }
     "contentType": enums.mimeTypes.applicationJson, or undefined if req.accepts are not supported 
     "isContentType": true if one of the accepts is supported 
     "isAuthorised": true,
     "isParamsValid" : true if all params are valid
     "isValid": true if isContent, isAuthorised, and isParamsValid
     "response":{Response}              // set if not valid else subclass sets it    
    
     constructor arguments 
    * @param {*} params                 // list of validated params { }
    * @param {*} contentType            // a content type supported by the Request supertype
    */
    constructor(params, contentType) {

        // validate contentype ----------------------------------------------------------
        this.contentType = contentType;
        this.isContentType = this.contentType != consts.NONE;                           // true if undefined

        // validate authorisation 
        let api_key = params[consts.API_KEY_PARAM_NAME];
        this.isAuthorised = validateAuthorisation(api_key);

        // validate params 
        this.params = params;
        this.isParamsValid = checkIfParamsValid(this.params);                           // assign instance property e.g this.params.energy and this.params.isValid

        // isValid --------------------------------------------------------------       // if not valid setup a generic response 
        this.isValid = this.isContentType && this.isParamsValid && this.isAuthorised;   // must have valid parameters and accept header and must be authorised
        
        this.response = this.isValid ? consts.NONE : new GenericResponse(
            this.isAuthorised,
            this.isContentType,
            this.isParamsValid
        );         // GenericResponse contains a generic error message as specified by the swagger genericMessage definition


        

    }
}

// validate the params and returns true only if all are valid 
function checkIfParamsValid(requestParams) {

    const ISVALID_PROPERTY_NAME = 'isValid';

    let allValid = false;
    if (requestParams) {

        let paramKeys = Object.keys(requestParams);


        allValid = true;
        paramKeys.forEach(key => {                                                      // Request.isValid is true only if *all* params are valid

            allValid = allValid && requestParams[key].isValid;                          // check if param was declared valid during construction 

        });
    }

    return allValid;

}

// check if request is authorised 
function validateAuthorisation(api_key) {

    let isAuth = false;
    if (api_key) {
        isAuth = api_key.isValid;                               // 2DO: in future need to call gcloud REST api to check if key is valid and has access to this API          
    }

    return isAuth;

}


module.exports = Request;

/*
 Selects an Accepts header. If an Accept header has not beem specified the default application/vnd.collection+json media type will be returned.
 If multiple Accept headers are sent the response will select one from the list of media types shown above, in the order shown.
 If the request Accept headers do not contain a type from the list above return 'undefined'
 */
module.exports.selectContentType = (req, responseContentTypes) => {

    let requestAcceptsType = req.accepts(responseContentTypes);        // returns false if request had Accept headers which do not match any of the responseContentTypes

    let contentTypeValue = requestAcceptsType == false ? consts.NONE : requestAcceptsType;

    return contentTypeValue;

}
