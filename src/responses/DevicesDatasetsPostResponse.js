//@ts-check
"use strict";
/**
 * ./responses/DatasetsPostResponse.js
 * creates a response for the /energy path. 
 */
const enums = require('../environment/enums');
const utils = require('../environment/utils');

const Response = require('./Response');
const producers = require('../producers');

const GenericMessage = require('../definitions/GenericMessage');
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

// constants
const VIEW_PREFIX = 'message_';     // prefix for a generic response  message
const RESPONSE_STATUS = enums.responseStatus[200];

class DevicesDatasetsPostResponse extends Response {

  /**
  * posts dataset data and responds with a generic 201 response
  * constructor arguments 
    * @param {*} params                                                       // dataset, datasets, apiKey
    * @param {*} reqAcceptParam                                               // request Accepts
    * 
    { dataset:
    Param {
      name: 'dataset',
      value: 'pms',
      isOptional: false,
      isValid: true },
    datasets:
    Param {
      name: 'datasets',
      value: [ [Object], [Object], [Object], [Object] ],
      isOptional: false,
      isValid: true },
    apiKey:
    Param {
      name: 'apikey',
      value: 'AIzaSyBczHFIdt3Q5vvZq_iLbaU6MlqzaVj1Ue0',
      isOptional: false,
      isValid: true } }
    * 
  */
  constructor(params, reqAcceptParam) {

    let content = executePost(params);                                            // perform the post operation 

    super(RESPONSE_STATUS, reqAcceptParam, VIEW_PREFIX, content);

  }
}

// perform the POST operation - all devices will create a kafka producer and send the dataset to a topic
function executePost(params) {

  // construct a producer
  let apiPathIdentifier = params.dataset.value;                                   //  enums.params.datasets              - e.g. pms  

  let sender = utils.keynameFromValue(enums.apiKey, params.apiKey.value);         // the 'source' is the keyname of the apikey enum (e.g. S001 for Sundaya dev and V001 for vendor dev)
  let datasets = params.datasets.value;                                           // for application/json the req.body is a 'datasets' object with array of datasets {"datasets": [.. ] 

  // sendToTopic (asynchronously)
  let producer = producers.getProducer(apiPathIdentifier);                        // apiPathIdentifier = enums.params.datasets..
  producer.sendToTopic(datasets, sender);                                         // async sendToTopic() ok as by now we have connected to kafka, and the dataset should have been validated and the only outcome is a 200 response
  

  // prepare the response
  let message = 'Data queued for processing.';
  let description = `datasets:${apiPathIdentifier} | ${datasets.length}`;
  let code = utils.keynameFromValue(enums.responseStatus, RESPONSE_STATUS);
  let status = RESPONSE_STATUS;
  let response = new GenericMessage(code, status, 
    new GenericMessageDetail().add(message, description).getElements());

  return response.getElements();

}

module.exports = DevicesDatasetsPostResponse;

/**
  * a list of mimetypes which this responder's request (DeviceDataPost) is able to support. 
  * the default mimetype must be the first item
  * this list must match the list specified in the 'produces' property in the openapi spec
  */
module.exports.produces = [enums.mimeType.applicationJson];
module.exports.consumes = [enums.mimeType.applicationJson, enums.mimeType.textCsv];
