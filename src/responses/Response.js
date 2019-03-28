//@ts-check
"use strict";
/**
 * ./responses/Response.js
 *  base type for view responses  
 * 
 */
// creates a response objectr for rendering and sending. 

class Response {
    constructor(view, status, data, mimetype) {
        this.view = view;
        this.status = status;
        this.data = data;
        this.contentType = mimetype;
    }
}

module.exports = Response;
