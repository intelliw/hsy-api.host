//@ts-check
"use strict";
/**
 * ./responses/GenericResponse.js
 * creates a generic response with a JSON message as defined in the openapi genericMessage definition
 */
const Response = require('./Response');
const enums = require('../system/enums');
const utils = require('../system/utils');
const GenericMessage = require('../definitions/GenericMessage');
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

const GENERIC_RESPONSE_VIEW_PREFIX = 'message_';
const GENERIC_RESPONSE_CONTENT_TYPE = enums.mimeTypes.applicationJson;       // standard content type for generic message
const DEFAULT_GENERIC_RESPONSE_STATUS = enums.responseStatus[400];

class GenericResponse extends Response {

  /**
  * creates a generic response bassed on standard properties of a Request supertype passed into the constructor 
  */
  constructor(requestIsAuthorised, requestIsContentType, requestIsValid) {

    // status         // determine status based on Request attributes

    let status = getStatus(requestIsAuthorised, requestIsContentType, requestIsValid);
    let content = getContent(status);

    super(status, GENERIC_RESPONSE_CONTENT_TYPE, GENERIC_RESPONSE_VIEW_PREFIX, content)

  }

}

// makes a generic message based on the status
function getContent(status) {

  // detail
  let message;
  let target;
  switch (status) {
    case enums.responseStatus[401]:                               // Unauthorized
      message = 'The client does not have sufficient permission.';
      target = 'params.api_key'
      break;

    case enums.responseStatus[415]:                               // Unsupported Media Type
      message = 'The requested Accept header type is not supported.';
      target = 'headers.Accept'
      break;

    case enums.responseStatus[400]:                               // Bad Request
    default:
      message = 'The client specified an invalid argument.';
      target = 'params[]'
      break;
  };
  let genericMessageDetail = new GenericMessageDetail(message, target);


  // create the genericMessage
  let code = utils.keynameFromValue(enums.responseStatus, status);    // '400'
  let genericMessage = new GenericMessage(code, status, genericMessageDetail.getElements());

  return genericMessage.getElements();

}

// gets the status depending on validation flags
function getStatus(requestIsAuthorised, requestIsContentType, requestIsValid) {

  let status = DEFAULT_GENERIC_RESPONSE_STATUS;

  if (!requestIsAuthorised) {
    status = enums.responseStatus[401];                               // Unauthorized

  } else if (!requestIsContentType) {
    status = enums.responseStatus[415];                               // Unsupported Media Type

  } else if (!requestIsValid) {
    status = enums.responseStatus[400];                               // Bad Request

  };

  return status;

}

module.exports = GenericResponse;


