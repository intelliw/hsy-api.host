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
    * adds detail elements for each statusEnum sent to the constructor
    * 
    instance attributes:  
     super.getElements().. => []
        message = 'The requested Accept header type is not supported.';
        target = 'Accept header'

    constructor arguments 
    * @param {*} statusEnums                                        //  [] array of statusEnums one for each invalid status 
    */
    constructor(statusEnums) {

        super();

        let detail;
        statusEnums.forEach(statusEnum => {
            detail= getDetail(statusEnum);
            super.add(detail);    
        });

    }

}

// makes a detail object for the status, with message and target properties 
function getDetail(statusEnum) {

    // detail
    let message;
    let target;

    switch (statusEnum) {
        case enums.responseStatus[401]:                             // Unauthorized
            message = 'The client does not have sufficient permission.';
            target = 'api_key parameter'
            break;

        case enums.responseStatus[415]:                             // Unsupported Media Type
            message = 'The requested Accept header type is not supported.';
            target = 'Accept header'
            break;

        case enums.responseStatus[400]:                             // Bad Request
            message = 'The client specified an invalid argument.';
            target = 'parameters'
            break;
    };

    // return a detail object
    return { "message": message, "target": target };

}

module.exports = GenericMessageDetail;
