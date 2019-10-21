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
    status                              // 415
    message                             // 'The requested Accept header type is not supported.';
    details                             // [    ] 

    constructor argumen ts 
    * @param {*} statusCode             // 415  
    * @param {*} messageText            // Unsupported Media Type   
    * @param {*} details                // GeenricMessageDetail.getElements() []
    */
    constructor(statusCode, messageText, details) {

        super();
        
        this.status = statusCode;
        this.message = messageText;
        this.details = details;

        let message = { "status": this.status, "message": this.message, "details": this.details }

        super.add(message);

    }



}

module.exports = GenericMessage;
