//@ts-check
"use strict";
/**
 * ./definitions/GenericMessage.js
 *  object for storing a generic message as defined in the openapi genericMessage definition
 */

const Definitions = require('../definitions/Definitions');

// a generic message as defined in the openapi genericMessage definition 
class GenericMessage extends Definitions {

    constructor(code, status, details) {

        super();

        let message = { "code": code, "status": status, "details": details };
        
        super.add(message);

    }

    

}

module.exports = GenericMessage;
