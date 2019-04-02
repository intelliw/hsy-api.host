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
const producesContentTypes = [enums.mimeTypes.applicationCollectionJson, enums.mimeTypes.applicationJson, enums.mimeTypes.textHtml, enums.mimeTypes.textPlain];
const responseStatus = 200;

class EnergyResponse extends Response  {

    constructor(executedData, requestAccepts) {
        
        super(requestAccepts, producesContentTypes, responseStatus, viewPrefix);
        
        this.content = executedData;
    }

}

module.exports = EnergyResponse;


