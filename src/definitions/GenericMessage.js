//@ts-check
"use strict";
/**
 * ./definitions/GenericMessage.js
 *  object for storing a generic message as defined in the openapi genericMessage definition
 */

const Definitions = require('../definitions/Definitions');

// a generic message as defined in the openapi genericMessage definition 
class GenericMessage extends Definitions {

    /**
    * create a GenericMessage with the details 
    * 
    instance attributes:  
     super.getElements().. => []
        status      // 'Accept header'
        message     // 'The requested Accept header type is not supported.';
        details     // [] 

    constructor arguments 
    * @param {*} statusCode          // 415  
    * @param {*} messageText         // Unsupported Media Type   
    * @param {*} details             // GeenricMessageDetail.getElements() []
    */
    constructor(statusCode, messageText, details) {

        super();

        let message = { "status": statusCode, "message": messageText, "details": details };

        super.add(message);

    }



}

module.exports = GenericMessage;
