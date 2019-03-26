//@ts-check
"use strict";
/**
 * ./parameters/Param.js
 *  supertype for response headers
 * 
 */
const enums = require('../system/enums');

// response header class retriueves request headers and stores property values for adding to a response 
class Headers {
    constructor(request) {
        
        this.contentType = selectMimeType(request.accepts());;
        
    }

}

//prioritises and selects a mime type based on accept headers in the request
function selectMimeType(reqAcceptHdrs) {

    const e = enums.mimeTypes;
    let header = e.default;                                 // start with the default - if no match this will be returned 

    if (reqAcceptHdrs.includes(e.applicationCollectionJson)) {
        header = e.applicationCollectionJson;

    } else if (reqAcceptHdrs.includes(e.applicationJson)) {
        header = e.applicationJson;

    } else if (reqAcceptHdrs.includes(e.textHtml)) {
        header = e.textHtml;

    } else if (reqAcceptHdrs.includes(e.textPlain)) {
        header = e.textPlain;

    }

    return header;

}


module.exports = Headers;

