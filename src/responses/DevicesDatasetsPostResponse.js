//@ts-check
"use strict";
/**
 * ./responses/DatasetsPostResponse.js
 * creates a response for the /energy path. 
 */
const enums = require('../host/enums');
const utils = require('../host/utils');

const Response = require('./Response');
const Producer = require('../producers');

const GenericMessage = require('../definitions/GenericMessage');
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

// constants
const VIEW_PREFIX = 'message_';     // prefix for a generic response  message
const RESPONSE_STATUS = enums.responseStatus[200];

class DevicesDatasetsPostResponse extends Response {

  /**
  * posts dataset data and responds with a generic 201 response
  */
  constructor(params, acceptParam) {

    let content = executePost(params);                                        // perform the post operation 


    super(RESPONSE_STATUS, acceptParam, VIEW_PREFIX, content);

  }
}

// perform the data operation 
function executePost(params) {

  let producer;
  let datasetName;
  let topicName;
  let datasets;

  datasetName = params.dataset.value;                                           //  enums.datasets              - e.g. pms  
  topicName = enums.messageBroker.topics.monitoring[datasetName];                //  lookup topic name based on datasetname
  datasets = params.datasets.value;
  
  producer = new Producer.DeviceDatasetProducer();
  
  producer.extractData(datasetName, datasets);
  producer.sendToTopic(topicName);                                              // datasetName is the topic

  // prepare the response
  let responseDetail = new GenericMessageDetail();
  responseDetail.add('Data queued for processing.', `dataset:${datasetName} | ${datasets.length}`);

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
