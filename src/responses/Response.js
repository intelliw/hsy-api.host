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
    instance attributes:  
     "statusCode": 400  (number)
     "contentType": enums.mimeTypes.applicationJson,
     "view": "message_applicationJson"
     "content": "{}",
    
     constructor arguments 
    * @param {*} statusEnum             //  "Bad Request"
    * @param {*} contentType        //   enums.mimeTypes.applicationJson
    * @param {*} viewPrefix         //  "message_"
    * @param {*} content            //  { .. }
    */
    constructor(statusEnum, contentType, viewPrefix, content) {


        // contentType
        this.contentType = contentType;
        let contentTypeKeyname = utils.keynameFromValue(enums.mimeTypes,contentType);

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
