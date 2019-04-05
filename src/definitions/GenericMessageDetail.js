//@ts-check
"use strict";
/**
 * ./definitions/GenericMessage.js
 *  object for storing a generic message as defined in the openapi genericMessage definition
 */

const Definitions = require('../definitions/Definitions');

// a generic message detail as specified in the openapi genericMessageDetail definition 
class GenericMessageDetail extends Definitions {

    constructor(message, target) {

        super();

        let detail = { "message": message, "target": target };
        
        super.add(detail);

    }

}

module.exports = GenericMessageDetail;
