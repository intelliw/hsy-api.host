//@ts-check
"use strict";
/**
 * ./responses/DatasetsPostResponse.js
 * creates a response for the /energy path. 
 */
const enums = require('../host/enums');
const utils = require('../host/utils');

const Response = require('./Response');
const GenericMessage = require('../definitions/GenericMessage');
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

const VIEW_PREFIX = 'message_';
const RESPONSE_STATUS = enums.responseStatus[201];

class DatasetsPostResponse extends Response {

  /**
  * posts dataset data and responds with a generic 201 response
  */
  constructor(params, contentType) {

    let content = "";   // 2DO
    
    let detail = new GenericMessageDetail();
    detail.add('New datasets created', `device:${params.device.value} | dataset:${params.dataset.value}`);

    let statusCode = utils.keynameFromValue(enums.responseStatus, RESPONSE_STATUS);
    let genericMessage = new GenericMessage(statusCode, RESPONSE_STATUS, detail.getElements());

    super(RESPONSE_STATUS, contentType, VIEW_PREFIX, genericMessage.getElements());

  }
}


module.exports = DatasetsPostResponse;

/**
  * a list of mimetypes which this responder's request (DeviceDataPost) is able to support. 
  * the default mimetype must be the first item
  * this list must match the list specified in the 'produces' property in the openapi spec
  */
module.exports.produces = [enums.mimeTypes.applicationJson];
