//@ts-check
"use strict";
/**
 * ./responses/ErrorResponse.js
 * creates a generic response with a JSON message as defined in the openapi genericMessage definition
 */
const enums = require('../host/enums');
const utils = require('../host/utils');
const consts = require('../host/constants');

const Response = require('./Response');
const GenericMessage = require('../definitions/GenericMessage');
const Param = require('../parameters');

const RESPONSE_VIEW_PREFIX = 'message_';
const RESPONSE_CONTENT_TYPE = new Param(consts.ACCEPT_TYPE_PARAM_NAME, enums.mimeTypes.applicationJson);     // standard content type for generic message

class ErrorResponse extends Response {

  /**
  * creates a generic response based on the validation results sent to the contructor 
  */
  constructor(validation) {

    if (validation.errors.getElements().length > 0) {

      // create the error message
      let statusEnum = selectResponseStatus(validation);
      let statusCode = utils.keynameFromValue(enums.responseStatus, statusEnum);     // '415'
      let genericMessage = new GenericMessage(statusCode, statusEnum, validation.errors.getElements());

      // create the Response including the message content
      super(statusEnum, RESPONSE_CONTENT_TYPE, RESPONSE_VIEW_PREFIX, genericMessage.getElements())

    }

  }
}

// returns a status enum based on validation results  
function selectResponseStatus(validation) {

  let messageStatusEnum;

  // Unauthorized
  if (!validation.isAuthorised) {

    messageStatusEnum = enums.responseStatus[401];

    // Unsupported Media Type
  } else if (!validation.isAcceptTypeValid) {
    messageStatusEnum = enums.responseStatus[415];

    // Bad Request
  } else if (!validation.isParamsValid) {
    messageStatusEnum = enums.responseStatus[400];

    // default 400
  } else {
    messageStatusEnum = enums.responseStatus[400];

  };

  return messageStatusEnum;

}

module.exports = ErrorResponse;


