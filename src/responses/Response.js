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
     "statusCode": 400  (number)
     "contentType": enums.mimeTypes.applicationJson,
     "view": "message_applicationJson"
     "content": "{}",
    
     constructor arguments 
    * @param {*} statusEnum         //  "Bad Request"
    * @param {*} acceptType         //   enums.mimeTypes.applicationJson
    * @param {*} viewPrefix         //  "message_"
    * @param {*} content            //  { .. }
    */
    constructor(statusEnum, acceptType, viewPrefix, content) {


        // contentType
        this.contentType = acceptType.value;
        let contentTypeKeyname = utils.keynameFromValue(enums.mimeTypes,acceptType.value);

        // view
        this.view = `${viewPrefix}${contentTypeKeyname}`;       // e.g. energy.applicationCollectionJson todo: this should be selected dynamically

        // statusCode    
        let statusCode = utils.keynameFromValue(enums.responseStatus,statusEnum);
        this.statusCode = Number(statusCode);                   // 400

        // content 
        this.content = content;
        
    }

}

module.exports = Response;
