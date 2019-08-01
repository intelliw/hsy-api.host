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
 * Confirms the request Content-Type header for parsing the request body. 
 * if body is empty any Content-Type is allowed. if missing the responseConsumes Content-Type is used as a default placeholder.
 * if body is not empty Content-Type must be a supported type ( req.is(responseConsumes) ) 
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
        const EMPTY_BODY = 0;              // zero keys if no body
        
        // isSupported  
        let requestContentType = req.headers[CONTENT_TYPE_HEADER];                                        // get the Content-Type header   
        let hasBody =  req.body ? Object.keys(req.body).length > EMPTY_BODY : false;                      // check if there is a body
        let isSupported = requestContentType && hasBody ? req.is(responseConsumes) : true;                // req.is returns null if no body. isSupported is true if header is in responseConsumes, or if there is no body 
        
        // call super
        requestContentType = isSupported ? responseConsumes : consts.NONE;                                // if not supported set requestContentType to NONE
        super(THIS_PARAM_NAME, requestContentType);

    }

}

module.exports = ContentType;
