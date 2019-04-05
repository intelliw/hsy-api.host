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
     "contentType": enums.mimeTypes.applicationJson, or udnefined is the accepts are not supported 
     "isContentType": true if one of the accepts is supported 
     "isAuthorised": true,
     "params": { .. }
     "isValid": true
     "response":{Response}
    constructor arguments 
    * @param {*} params          // "400"
    * @param {*} requestAccepts         //  enums.mimeTypes.applicationJson
    * @param {*} producesContentTypes   // list of content types supported by the Request supertype
    */
    constructor(params, requestAccepts, producesContentTypes) {

        
        // validate contentype ----------------------------------------------------------
        this.contentType = selectContentType(requestAccepts, producesContentTypes);
        this.isContentType = !(this.contentType == consts.NONE);
        
        // validate authorisation 
        let api_key = params[consts.API_KEY_PARAM_NAME];
        this.isAuthorised = validateAuthorisation(api_key);

        // validate all params as a set 
        let paramsValid = allParamsValid(params);        // assign instance property e.g this.params.energy and this.params.isValid
        this.params = params;

        // setup isValid -------------------------------------------------------------- // if not valid setup a generic response 
        this.isValid = this.contentType && paramsValid && this.isAuthorised;         // must have valid parameters and accept header and must be authorised
        this.response = this.isValid ? consts.NONE : new GenericResponse(
            this.isAuthorised,
            this.isContentType,
            this.isValid
        );         // GenericResponse contains a generic error message as specified by the openapi genericMessage definition
    }
}

// validate the params and returns true only if all are valid 
function allParamsValid(requestParams) {

    const ISVALID_PROPERTY_NAME = 'isValid';

    let allValid = false;
    if (requestParams) {

        let paramKeys = Object.keys(requestParams);
        
        
        allValid = true;
        paramKeys.forEach(key => {                     // Request.isValid is true only if *all* params are valid

            allValid = allValid && requestParams[key].isValid;            // check if param was declared valid during construction 

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


// selects an Accepts header
function selectContentType(requestAccepts, responseContentTypes) {

    /*
     If an Accept header has not beem specified the default application/vnd.collection+json media type will be returned.
     If multiple Accept headers are sent the response will select one from the list of media types shown above, in the order shown.
     If the request Accept headers do not contain a type from the list above return 'undefined'
     */
    
    const NO_DEFAULT = false; 
    const ACCEPT_ANY = '*/*'            // value provided by express when no Accept header is present 

    let contentTypeValue; 
    
    if (!requestAccepts || requestAccepts == ACCEPT_ANY) {                                                                                     // if there were no Accept headers select the default          
        contentTypeValue = enums.mimeTypes.default;
    } else {
        contentTypeValue = utils.selectFirstMatch(responseContentTypes, requestAccepts, NO_DEFAULT);          // if there were multiple Accept headers select the first supported, return undefined if none match 
    }

    return contentTypeValue;

}

module.exports = Request;
