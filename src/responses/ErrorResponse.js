//@ts-check
"use strict";
/**
 * ./responses/ErrorResponse.js
 * creates a generic response with a JSON message as defined in the openapi genericMessage definition
 */
const enums = require('../system/enums');
const utils = require('../system/utils');

const Response = require('./Response');
const GenericMessage = require('../definitions/GenericMessage');
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

const RESPONSE_VIEW_PREFIX = 'message_';
const RESPONSE_CONTENT_TYPE = enums.mimeTypes.applicationJson;       // standard content type for generic message
const DEFAULT_RESPONSE_STATUS = enums.responseStatus[400];

class ErrorResponse extends Response {

  /**
  * creates a generic response bassed on standard properties of a Request supertype passed into the constructor 
  */
  constructor(requestIsAuthorised, requestIsContentType, requestIsParamsValid, requestErrors) {

    if (requestErrors.getElements().length > 0) {
      
      // create the error message
      let statusEnum = selectResponseStatus(requestIsAuthorised, requestIsContentType, requestIsParamsValid);
      let statusCode = utils.keynameFromValue(enums.responseStatus, statusEnum);     // '400'
      let genericMessage = new GenericMessage(statusCode, statusEnum, requestErrors.getElements());

      // create the Response including the message content
      super(statusEnum, RESPONSE_CONTENT_TYPE, RESPONSE_VIEW_PREFIX, genericMessage.getElements())

    }

  }
}

// returns a status enum based on the request validation flags  
function selectResponseStatus(requestIsAuthorised, requestIsContentType, requestIsParamsValid) {

  let messageStatusEnum;

  // Bad Request
  if (!requestIsParamsValid) {
    messageStatusEnum = enums.responseStatus[400];              
  
    // Unauthorized
  } else if (!requestIsAuthorised) {

    messageStatusEnum = enums.responseStatus[401];              
  
    // Unsupported Media Type
  } else if (!requestIsContentType) {
    messageStatusEnum =  enums.responseStatus[415];              
    
  };

  return messageStatusEnum;

}

module.exports = ErrorResponse;


