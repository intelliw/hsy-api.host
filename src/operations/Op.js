//@ts-check
"use strict";
/**
 * ./operations/Op.js
 * base class for operation classes
 *  
 */

 /**
 * stores data and status for an operation in a Response object, and the headers
 */
class Op {

    // 
    constructor() {
        this.response = {};                 // this can be a 400, it will be replaced by the subclass after it processes its operation 
    }

}

module.exports = Op;
