//@ts-check
"use strict";
/**
 * ./responses/Response.js
 *  base type for view responses  
 * 
 */
// creates a response objectr for rendering and sending. 
const Headers = require('./headers');

class Response {
    constructor(view, status, data, responseHeaders) {
        this.view = view;
        this.status = status;
        this.data = data;
        this.headers = responseHeaders;
    }
}

module.exports = Response;
