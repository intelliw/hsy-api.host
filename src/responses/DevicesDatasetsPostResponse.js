//@ts-check
"use strict";
/**
 * ./responses/DatasetsPostResponse.js
 * creates a response for the /energy path. 
 */
const enums = require('../host/enums');
const utils = require('../host/utils');

const Response = require('./Response');
const DevicesDatasetsProducer = require('../dataloggers/DevicesDatasetsProducer');

const GenericMessage = require('../definitions/GenericMessage');
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

// REQUEST constants
const VIEW_PREFIX = 'message_';     // prefix for a generic response  message
const RESPONSE_STATUS = enums.responseStatus[201];

class DevicesDatasetsPostResponse extends Response {

  /**
  * posts dataset data and responds with a generic 201 response
  */
  constructor(params, acceptParam) {

    let content = executeDevicesDatasetsPost(params);                                       // perform the post operation 
    

    super(RESPONSE_STATUS, acceptParam, VIEW_PREFIX, content);

  }
}

// perform the energy data operation and return a collections array
function executeDevicesDatasetsPost(params) {

  params.deviceDatasetItems.value.forEach(dataset => {
    let producer = new DevicesDatasetsProducer(dataset); 

    // console.log(dataset.device);
    //dataset.data
    producer.sendMessages();
  });
  
  
  //console.dir(params.deviceDatasetItems[0]);




  // prepare the response
  let responseDetail = new GenericMessageDetail();
  responseDetail.add('New datasets created', `device:${params.deviceDatasetItems.value[0].device} | dataset:${params.deviceDatasetItems.value[0].dataset}`);

  let statusCode = utils.keynameFromValue(enums.responseStatus, RESPONSE_STATUS);
  let response = new GenericMessage(statusCode, RESPONSE_STATUS, responseDetail.getElements());

  return response.getElements();

}


module.exports = DevicesDatasetsPostResponse;

/**
  * a list of mimetypes which this responder's request (DeviceDataPost) is able to support. 
  * the default mimetype must be the first item
  * this list must match the list specified in the 'produces' property in the openapi spec
  */
module.exports.produces = [enums.mimeTypes.applicationJson];
module.exports.consumes = enums.mimeTypes.applicationJson;
