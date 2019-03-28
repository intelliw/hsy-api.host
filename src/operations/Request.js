//@ts-check
"use strict";
/**
 * ./operations/Op.js
 * base class for operation classes
 *  
 */
const enums = require('../system/enums');
 /**
 * stores data and status for an operation in a Response object, and the headers
 */
class Request {

    // base constructor selects and sets the mime type for all requests
    constructor(reqAcceptHeaders) {
        this.accept = selectMimeType(reqAcceptHeaders);
    }
    
    // subtype implements the execute method to return a Response 
    execute() {
        
    }

}

//prioritises and selects a mime type from the list of request Accept headers 
 function selectMimeType (reqAcceptHeaders) {

    const e = enums.mimeTypes;
    let header = e.default;                                 // start with the default - if no match this will be returned 

    if (reqAcceptHeaders.includes(e.applicationCollectionJson)) {
        header = e.applicationCollectionJson;

    } else if (reqAcceptHeaders.includes(e.applicationJson)) {
        header = e.applicationJson;

    } else if (reqAcceptHeaders.includes(e.textHtml)) {
        header = e.textHtml;                               // todo:  develope a viewfor text/html 
        

    } else if (reqAcceptHeaders.includes(e.textPlain)) {
        header = e.textPlain;

    }

    return header;

}

module.exports = Request;
