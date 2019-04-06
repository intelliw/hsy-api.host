//@ts-check
"use strict";
/**
 * ./responses/GenericResponse.js
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

class GenericResponse extends Response {

  /**
  * creates a generic response bassed on standard properties of a Request supertype passed into the constructor 
  */
  constructor(requestIsAuthorised, requestIsContentType, requestIsParamsValid) {

    const FIRST_ITEM = 0;

    // get a list of error statuses
    let statusEnums = getStatusEnums(requestIsAuthorised, requestIsContentType, requestIsParamsValid);
    if (statusEnums.length > 0) {
      
      
      // create genericMessageDetail based on statuses
      let genericMessageDetail = new GenericMessageDetail(statusEnums);    // adds a detail elemeent for each invalid status

      // create a GenericMessage with the details 
      let firstStatusEnum = statusEnums[FIRST_ITEM];
      let statusCode = utils.keynameFromValue(enums.responseStatus, firstStatusEnum);    // '400'

      let genericMessage = new GenericMessage(statusCode, firstStatusEnum, genericMessageDetail.getElements());

      // create the Response with the GenericMessage content
      super(firstStatusEnum, RESPONSE_CONTENT_TYPE, RESPONSE_VIEW_PREFIX, genericMessage.getElements())

    }

  }
}

// gets an array of statuses depending on validation flags
function getStatusEnums(requestIsAuthorised, requestIsContentType, requestIsParamsValid) {

  let statusEnums = [];

  if (!requestIsAuthorised) {
    statusEnums.push(enums.responseStatus[401]);              // Unauthorized
  };

  if (!requestIsContentType) {
    statusEnums.push(enums.responseStatus[415]);              // Unsupported Media Type
  };

  if (!requestIsParamsValid) {
    statusEnums.push(enums.responseStatus[400]);              // Bad Request
  };

  return statusEnums;

}

module.exports = GenericResponse;


