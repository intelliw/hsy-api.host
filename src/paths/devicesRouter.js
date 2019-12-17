//@ts-check
'use strict';
/**
 * ./paths/DevicesDatasetsPost.js
 * handlers for /devices path  
 */
const express = require('express');
const router = express.Router();
const csvSyncParse = require('csv-parse/lib/sync')

const enums = require('../environment/enums');
const utils = require('../environment/utils');
const consts = require('../host/constants');
const log = require('../logger').log;

const Request = require('./Request');
const Param = require('../parameters');
const Datasets = require('../parameters/Datasets');

const Response = require('./Response');
const producers = require('../producers');

const GenericMessage = require('../definitions/GenericMessage');
const GenericMessageDetail = require('../definitions/GenericMessageDetail');

// constants
const VIEW_PREFIX = 'message_';     // prefix for a generic response  message
const RESPONSE_STATUS = enums.responseStatus[200];

/*  [devices.dataset.pms.post]
    [devices.dataset.mppt.post]
    [devices.dataset.inverter.post]
*/
router.post('/dataset/:dataset',
    (req, res, next) => {

        // request ---------------------                                
        let request = new DevicesDatasetsPost(req);

        //  execute if valid
        let response = request.response;                                // execute the operation and return a response 
        let items = response.content;

        // trace log the response if it is not a 200 
        if (!utils.is200response(response.statusCode)) {
            log.trace(log.enums.labels.responseStatus, `${response.statusCode}`, JSON.stringify(items));
        }

        // response
        res
            .status(response.statusCode)
            .type(response.contentType)
            .render(response.view, {
                collections: items
            });

    });


// REQUEST -----------------------------------------------------------------------------------------------------------

class DevicesDatasetsPost extends Request {

    /**
     * extracts parameters and content type and calls super to validate  
     * if not valid super will create a generic error response
     * if valid this class will construct a DatasetsPostResponse to produce the response content
    
     instance attributes:  
     super ..
     response : this class sets response only if super does not set it with an error
    
     constructor arguments 
    * @param {*} req                                                    // express req
    */
    constructor(req) {

        let datasetName, datasets, contentType, isPmsCsv;

        // body content - check if json or csv                                                      // for application/json this is a datasets object with array of datasets {"datasets": [.. ] 
        datasetName = req.params.dataset;                                                               // dataset is a query string param         
        contentType = req.headers[enums.request.headers.contentType];                               // text/csv or application/json

        // convert if pms csv                                                                       // for text/csv req body contains raw csv content, for application/json the req.body is a 'datasets' object with array of datasets {"datasets": [.. ]                        
        isPmsCsv = (contentType == enums.mimeType.textCsv) && (datasetName == enums.params.datasets.pms);     // text/csv supported for pms only
        if (isPmsCsv) {
            datasets = pmsCsvToJson(`${req.body}`);                                                 // for text/csv this is raw csv content. use template literal to handle embedded quotes in the data !
        } else {
            datasets = req.body.datasets;
        }

        // parameters                                                       
        let params = {};
        params.dataset = new Param('dataset', datasetName, consts.NONE, enums.params.datasets);     // this is the path parameter e.g. pms
        params.datasets = new Datasets(datasetName, datasets);                                      // Datasets validates the devices req.body.datasets payload. 

        // super Request- creates a Validate object to validate all params, auth, and accept header
        super(req, params, DevicesDatasetsPostResponse.produces, DevicesDatasetsPostResponse.consumes);           // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        params.apiKey = this.apiKey;                                                                // add apiKey as a param as it is used to produce the sys.source attribute in the Producer  

        // trace log the request
        log.trace(log.enums.labels.requestStatus, `${datasetName} POST ${contentType}, sender:${Param.ApiKey.getSender(this.apiKey.value)}, valid?${this.validation.isValid}`, JSON.stringify({ datasets: datasets }));

        // execute the response only if super isValid                                               // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid === true ? new DevicesDatasetsPostResponse(this.params, this.accept) : this.response;

    }

}

// parse csv into json array of datasets - csv must have headers. error rows are skippsed (e.g. missing closing quote)
function pmsCsvToJson(csvData) {

    const CELL_VOLTS_COLUMNS = 14;
    const CELL_OPEN_COLUMNS = 14;
    const FET_OPEN_COLUMNS = 2;

    let dataset = consts.NONE;
    let json = [];
    let pmsId = '';

    // sync-parse to get all the csv rows
    const csvRows = csvSyncParse(csvData.trim(), {
        columns: true,
        skip_empty_lines: true
    })

    // convert each csv row to pms json
    csvRows.forEach(csvRow => {

        // if new/different pms id 
        if (pmsId !== csvRow['pms.id'].trim()) {

            // add dataset to json array (except when dataset is empty at the start)
            if (dataset !== consts.NONE) json.push(dataset);

            // reinitialise dataset as a new one
            pmsId = csvRow['pms.id'].trim();
            dataset = { pms: { id: pmsId }, data: [] }
        }

        // make the data arrays for cell.open[], cell.volts[], fet.open[]
        let cellOpen = csvBooleanToColumnPosArray(csvRow, 'cell.open', CELL_OPEN_COLUMNS);
        let cellVolts = csvToFloatArray(csvRow, 'cell.volts', CELL_VOLTS_COLUMNS);
        let fetOpen = csvBooleanToColumnPosArray(csvRow, 'fet.open', FET_OPEN_COLUMNS);

        // add a data object for this csv row, to the 'dataset.data' array
        dataset.data.push(csvToPmsDataObj(csvRow, cellOpen, cellVolts, fetOpen));

    });

    json.push(dataset);
    return json;

}

// converts a sequence of csv columns into a float array. numColumns gives the number of 'columnName' columns to parse into the array
function csvToFloatArray(csvRow, columnName, numColumns) {
    let floatArray = [];

    for (let col = 1; col <= numColumns; col++) {
        let value = csvRow[`${columnName}.${col}`].trim();
        floatArray.push(parseFloat(value));
    }

    return floatArray;
}

/* converts boolean true in csv columns into an array of column positiuons. 
 * e.g. csv 0,0,0 returns an empty array [] as there are no true value; 
 * csv 0,1,0 returns [2] as column 2 is true. 
 * number of 'columnName' columns to parse into the array
 */
function csvBooleanToColumnPosArray(csvRow, columnName, numColumns) {
    let columnPosArray = [];

    for (let col = 1; col <= numColumns; col++) {
        let value = parseInt(csvRow[`${columnName}.${col}`].trim());
        if (value) columnPosArray.push(col);
    }

    return columnPosArray;
}

// converts a csv row into a pms data object e.g. 
function csvToPmsDataObj(csvRow, cellOpenArray, cellVoltsArray, fetOpenArray) {

    let dataObj = {
        time_local: csvRow['time_local'],
        pack: {
            id: csvRow['pack.id'],
            dock: parseInt(csvRow['pack.dock']),
            amps: parseFloat(csvRow['pack.amps']),
            temp: [
                parseFloat(csvRow['pack.temp.1']),
                parseFloat(csvRow['pack.temp.2']),
                parseFloat(csvRow['pack.temp.3'])],
            cell: {
                open: cellOpenArray,
                volts: cellVoltsArray
            },
            fet: {
                open: fetOpenArray,
                temp: [
                    parseFloat(csvRow['fet.temp.1']),
                    parseFloat(csvRow['fet.temp.2'])]
            },
            status: csvRow['status']
        }
    }

    return dataObj;
}

// RESPONSE -----------------------------------------------------------------------------------------------------------

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

    /**
      * a list of mimetypes which this responder's request (DeviceDataPost) is able to support. 
      * the default mimetype must be the first item
      * this list must match the list specified in the 'produces' property in the openapi spec
      */
    static get produces() { return [enums.mimeType.applicationJson] };
    static get consumes() { return [enums.mimeType.applicationJson, enums.mimeType.textCsv] };

}

// perform the POST operation - all devices will create a kafka producer and send the dataset to a topic
function executePost(params) {

    // construct a producer
    let apiPathIdentifier = params.dataset.value;                                   //  enums.params.datasets              - e.g. pms  

    let sender = Param.ApiKey.getSender(params.apiKey.value);                       // the 'source' is the keyname of the apikey enum (e.g. S001 for Sundaya dev and V001 for vendor dev)
    let datasets = params.datasets.value;                                           // for application/json datasets param is the *array* (of datasets) in the req.body e.g.  the [.. ] array in {"datasets": [.. ] 

    // sendToTopic (asynchronously)
    let producer = producers.getProducer(apiPathIdentifier);                        // apiPathIdentifier = enums.params.datasets..
    producer.sendToTopic(datasets, sender);                                         // async sendToTopic() ok as by now we have connected to kafka/pubsub, and the dataset should have been validated and the only outcome is a 200 response

    // prepare the response
    let message = 'Data queued for processing.';
    let description = `datasets:${apiPathIdentifier} | ${datasets.length}`;
    let code = utils.keynameFromValue(enums.responseStatus, RESPONSE_STATUS);
    let status = RESPONSE_STATUS;
    let response = new GenericMessage(code, status,
        new GenericMessageDetail().add(message, description).getElements());

    return response.getElements();

}


module.exports = router;
