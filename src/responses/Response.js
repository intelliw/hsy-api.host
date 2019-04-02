//@ts-check
"use strict";
/**
 * ./responses/Response.js
 *  base type for view responses  
 *  creates a response object for rendering and sending. 
 */
const enums = require('../system/enums');
const utils = require('../system/utils');

class Response {

    /**
     * base constructor sets response properties 
     */
    constructor(requestAccepts, responseContentTypes, responseStatus, viewPrefix) {

        // contentType
        let contentTypeValue = utils.selectFirstMatch(responseContentTypes, requestAccepts, true);        // if request had multiple Accept headers this will select a header supported by the response  
        this.contentType = contentTypeValue;
        
        // view
        let contentTypeKeyname = utils.keynameFromValue(enums.mimeTypes,contentTypeValue); 
        this.view = `${viewPrefix}${contentTypeKeyname}`;       // e.g. energy.applicationCollectionJson todo: this should be selected dynamically
        
        // status    
        this.status = responseStatus;                           // e.g. 200 

        // content (the data) is set by the subclass 

    }

}

module.exports = Response;
