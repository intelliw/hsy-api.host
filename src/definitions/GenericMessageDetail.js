//@ts-check
"use strict";
/**
 * ./definitions/GenericMessage.js
 *  object for storing a generic message as defined in the openapi genericMessage definition
 */
const enums = require('../environment/enums');

const Definitions = require('../definitions/Definitions');

// generic message detail as specified in openapi genericMessageDetail definition
class GenericMessageDetail extends Definitions {

    /**
    * stores detail elements for a GenericMessage
    * 
    instance attributes:  
     super.getElements().. => []
        message = 'The requested Accept header type is not supported.';
        description = 'Accept header'

    constructor arguments 
    */
    constructor() {

        super();

    }

    // return this to enable 'fluent' coding with the returned object 
    add (message, description) {
       
       const detail = { "message": message, "description": description };
       super.add(detail);    

       return this;

    }


}

// makes a detail object for the status, with message and description properties 
function getDetail(statusEnum) {

    // detail
    let message;
    let description;

    switch (statusEnum) {
        case enums.responseStatus[401]:                             // Unauthorized
  
    }

    // return a detail object
    return { "message": message, "description": description };

}

module.exports = GenericMessageDetail;
