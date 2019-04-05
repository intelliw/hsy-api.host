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
     "status": "Bad Request",
     "code": "400",
     "contentType": enums.mimeTypes.applicationJson,
     "view": "message_applicationJson"
     "content": "{}",
    constructor arguments 
    * @param {*} status             //  "Bad Request"
    * @param {*} contentType        //  enums.mimeTypes.applicationJson
    * @param {*} viewPrefix         // "message_"
    * @param {*} content            // { .. }
    */
    constructor(status, contentType, viewPrefix, content) {


        // contentType
        this.contentType = contentType;
        
        // view
        let contentTypeKeyname = utils.keynameFromValue(enums.mimeTypes,contentType);
        
        this.view = `${viewPrefix}${contentTypeKeyname}`;       // e.g. energy.applicationCollectionJson todo: this should be selected dynamically

        // status    
        let code = utils.keynameFromValue(enums.responseStatus,status);
        
        this.code = code;                               // "400"
        this.status = status;                           // "Bad Request"

        // content 
        this.content = content;
        
    }


}

module.exports = Response;
