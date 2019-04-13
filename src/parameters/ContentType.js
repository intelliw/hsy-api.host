//@ts-check
"use strict";
/**
 * ./parameters/ContentType.js
 * the validated request Content-Type
 *  
 */
const consts = require('../host/constants');

const Param = require('./Param');
const THIS_PARAM_NAME = 'contentType';

/** 
 * Confirms the Content Type decalred in the request Content-Type header for the request body.  
 * If the request Content-Type header is provided it must match the content type expected by the response (as stated in the responseConsumes constructor argument)
 * If the request Content-Type header is missing the responseConsumes Content-Type is used as the default.
 */
class ContentType extends Param {
    /**
    instance attributes:  
     super.name: "accept", 
     super.value: ?,
     super.isValid: ?,
    
     constructor arguments  
    * @param {*} req                    // express request
    * @param {*} responseConsumes       // a single enum.mimeTyypes value which is supported by the response/producer for reading the request body
    */
    constructor(req, responseConsumes) {
        
        const CONTENT_TYPE_HEADER = 'content-type';

        // check request 'content-type' or default to responseConsumes if missing 
        let requestContentType = req.headers[CONTENT_TYPE_HEADER] ? req.is(responseConsumes) : responseConsumes;     // returns false if request had Content-Type headers which do not match any of the responseContentTypes

        // call super
        requestContentType = (requestContentType == false) ? consts.NONE : requestContentType;  // if there  is no value super wil set isValid to false./.
        super(THIS_PARAM_NAME, requestContentType);
        
    }

}

module.exports = ContentType;
