//@ts-check
"use strict";
/**
 * ./definitions/GenericMessage.js
 *  object for storing a generic message as defined in the openapi genericMessage definition
 */
const enums = require('../system/enums');

const Definitions = require('../definitions/Definitions');

// generic message detail as specified in openapi genericMessageDetail definition
class GenericMessageDetail extends Definitions {

    /**
    * stores detail elements for a GenericMessage
    * 
    instance attributes:  
     super.getElements().. => []
        message = 'The requested Accept header type is not supported.';
        target = 'Accept header'

    constructor arguments 
    */
    constructor() {

        super();

    }

    add (message, target) {
       
       const detail = { "message": message, "target": target };
       super.add(detail);    

    }


}

// makes a detail object for the status, with message and target properties 
function getDetail(statusEnum) {

    // detail
    let message;
    let target;

    switch (statusEnum) {
        case enums.responseStatus[401]:                             // Unauthorized
  
    };

    // return a detail object
    return { "message": message, "target": target };

}

module.exports = GenericMessageDetail;
