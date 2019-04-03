//@ts-check
"use strict";
/**
 * ./responses/EnergyResponse.js
 * creates a response for the /energy path. 
 */
const Response = require('./Response');
const enums = require('../system/enums');
const utils = require('../system/utils');


const viewPrefix = 'energy_';
/**
  * a list of mimetypes which this response is able to produce. 
  * the default mimetype must be the first item
  * this list must match the list specified in the 'produces' property in the openapi spec
  */
const PRODUCES_CONTENT_TYPES = [enums.mimeTypes.applicationCollectionJson, enums.mimeTypes.applicationJson, enums.mimeTypes.textHtml, enums.mimeTypes.textPlain];
const RESPONSE_STATUS = enums.responseStatus.OK;

class EnergyResponse extends Response  {

    constructor(executedData, requestAccepts) {
        
        super(requestAccepts, PRODUCES_CONTENT_TYPES, RESPONSE_STATUS, viewPrefix);
        
        this.content = executedData;
    }

}

module.exports = EnergyResponse;


