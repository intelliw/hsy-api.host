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
    constructor(req, view, status, data) {
        
        this.status = status;
        this.data = data;
        this.headers = new Headers(req);
    }
}

module.exports = Response;
module.exports.headers = this.headers;
