//@ts-check
"use strict";
/**
 * ./responses/DatasetsPostResponse.js
 * creates a response for the /energy path. 
 */
const enums = require('../environment/enums');
const utils = require('../environment/utils');

const Response = require('./Response');
const KafkaProducer = require('../producers/KafkaProducer');

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

// perform the data operation 
function executePost(params) {

  // construct a producer
  let apiDatasetName = params.dataset.value;                                      //  enums.params.datasets              - e.g. pms  
  
  let datasets = params.datasets.value;                                           // for application/json the req.body is a 'datasets' object with array of datasets {"datasets": [.. ]        
  let sender = utils.keynameFromValue(enums.apiKey, params.apiKey.value);         // the 'source' is the keyname of the apikey enum (e.g. S001 for Sundaya dev and V001 for vendor dev)
  
  // get a producer (MonitoringPms etc) from the factory and process the messages (sendToTopic) asynchronously.
  let producer = KafkaProducer.getProducer(apiDatasetName);                       // apiDatasetName = enums.params.datasets..
  producer.sendToTopic(datasets, sender);                                         // async ok as by now we have connected to kafka, and the dataset should have been validated and the only outcome is a 200 response

  // prepare the response
  let responseDetail = new GenericMessageDetail();
  responseDetail.add('Data queued for processing.', `datasets:${apiDatasetName} | ${datasets.length}`);

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
module.exports.consumes = [enums.mimeTypes.applicationJson, enums.mimeTypes.textCsv];
