//@ts-check
"use strict";
/**
 * ./responses/Response.js
 *  base type for view responses  
 *  creates a response object for rendering and sending. 
 */
const enums = require('../host/enums');
const utils = require('../host/utils');

class Response {

    /**
    instance attributes:  
     statusCode: 400  (number)
     contentType: request Accept mime type - enums.mimeTypes
     consumes: request body Content-Type mime type - enums.mimeTypes 
     view: "message_applicationJson"
     content: "{}",
    
     constructor arguments 
    * @param {*} statusEnum                 // "Bad Request"
    * @param {*} reqAcceptParam             //  request Accepts - enums.mimeTypes
    * @param {*} viewPrefix                 // "message_"
    * @param {*} content                    //  { .. }
    */
    constructor(statusEnum, reqAcceptParam, viewPrefix, content) {

        // contentType
        this.contentType = reqAcceptParam.value;
        
        // view
        let contentTypeKeyname = utils.keynameFromValue(enums.mimeTypes,reqAcceptParam.value);
        this.view = `${viewPrefix}${contentTypeKeyname}`;       // e.g. energy.applicationCollectionJson todo: this should be selected dynamically

        // statusCode    
        let statusCode = utils.keynameFromValue(enums.responseStatus,statusEnum);
        this.statusCode = Number(statusCode);                   // 400

        // content 
        this.content = content;

        
    }

}

module.exports = Response;
