//@ts-check
"use strict";
/**
 * ./responses/Response.js
 *  base type for view responses  
 *  creates a response object for rendering and sending. 
 */
const enums = require('../environment/enums');
const utils = require('../environment/utils');

class Response {

    /**
    instance attributes:  
     statusCode: 400  (number)
     contentType: request Accept mime type - enums.mimeType
     consumes: request body Content-Type mime type - enums.mimeType 
     view: "message_applicationJson"
     content: "{}",
    
     constructor arguments 
    * @param {*} statusEnum                 // "Bad Request"
    * @param {*} reqAcceptParam             //  request Accepts - enums.mimeType
    * @param {*} viewPrefix                 // "message_"
    * @param {*} content                    //  { .. }
    */
    constructor(statusEnum, reqAcceptParam, viewPrefix, content) {

        // response contentType is request Accept
        this.contentType = reqAcceptParam.value;
        
        // view
        let contentTypeKeyname = utils.keynameFromValue(enums.mimeType,reqAcceptParam.value);
        this.view = `${viewPrefix}${contentTypeKeyname}`;                           // e.g. energy_textHtml, or energy_applicationCollectionJson - todo: this should really be a dynamic selection

        // statusCode    
        let statusCode = utils.keynameFromValue(enums.responseStatus,statusEnum);   // e.g. '200'   
        this.statusCode = parseInt(statusCode);                                     // 400

        // content 
        this.content = content;

        
    }

}

module.exports = Response;
