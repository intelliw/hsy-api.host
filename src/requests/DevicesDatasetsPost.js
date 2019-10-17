//@ts-check
"use strict";
/**
 * ./requests/DatasetsPostRequest.js
 * prepares data and response for the devices datasets post path 
 */
const enums = require('../host/enums');

const Response = require('../responses');
const DatasetsPostResponse = require('../responses/DevicesDatasetsPostResponse');

const Request = require('./Request');
const Param = require('../parameters');

const csvSyncParse = require('csv-parse/lib/sync')

const NONE = global.undefined;
/**
 * 
 */
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

        let dataset, datasets, contentType, isPmsCsv;

        // body content - check if json or csv                                                      // for application/json this is a datasets object with array of datasets {"datasets": [.. ] 
        dataset = req.params.dataset;                                                               // dataset is a query string param         
        contentType = req.headers[enums.request.headers.contentType];                               // text/csv or application/json
        isPmsCsv = (contentType == enums.mimeTypes.textCsv) && (dataset == enums.params.datasets.pms);     // text/csv supported for pms only
        
        // convert if pms csv                                                                       // for text/csv req body contains raw csv content, for application/json the req.body is a 'datasets' object with array of datasets {"datasets": [.. ]                        
        if (isPmsCsv) {
            datasets = pmsCsvToJson(`${req.body}`);                                                 // use template literal to handle embedded quotes in the data
        } else {
            datasets = req.body.datasets;
        }
        
        // parameters                                                       
        let params = {};
        params.dataset = new Param('dataset', dataset, NONE, enums.params.datasets);
        params.datasets = new Param('datasets', datasets);                                          // for text/csv this is raw csv content 

        // super - validate params, auth, accept header
        super(req, params, DatasetsPostResponse.produces, DatasetsPostResponse.consumes);           // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        params.apiKey = this.apiKey;                                                                // add apiKey as a param as it is used to produce the sys.source attribute in the Producer  

        // execute the response only if super isValid                                               // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid === true ? new Response.DevicesDatasetsPostResponse(this.params, this.accept) : this.response;

    }

}

// parse csv into json array of datasets - csv must have headers. error rows are skippsed (e.g. missing closing quote)
function pmsCsvToJson(csvData) {

    const CELL_VOLTS_COLUMNS = 14;
    const CELL_OPEN_COLUMNS = 14;
    const FET_OPEN_COLUMNS = 2;

    let dataset = NONE;
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
            if (dataset !== NONE) json.push(dataset);

            // reinitialise dataset as a new one
            pmsId = csvRow['pms.id'].trim();
            dataset = { pms: { id: pmsId }, data: [] }
        }

        // make the data arrays for cell.open[], cell.volts[], fet.open[]
        let cellOpen = csvToFloatArray(csvRow, 'cell.open', CELL_OPEN_COLUMNS);
        let cellVolts = csvToFloatArray(csvRow, 'cell.volts', CELL_VOLTS_COLUMNS);
        let fetOpen = csvToFloatArray(csvRow, 'fet.open', FET_OPEN_COLUMNS);

        // add a data object for this csv row, to the 'dataset.data' array
        dataset.data.push(csvToPmsDataObj(csvRow, cellOpen, cellVolts, fetOpen));

    });

    json.push(dataset);
    return json;

}

// converts a sequence of csv columns into a float array
function csvToFloatArray(csvRow, columnName, numColumns) {
    let floatArray = [];

    for (let i = 1; i <= numColumns; i++) {
        let value = csvRow[`${columnName}.${i}`].trim();
        if (value !== '') floatArray.push(parseFloat(value));
    }

    return floatArray;
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
                volts: cellVoltsArray },
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


module.exports = DevicesDatasetsPost;


