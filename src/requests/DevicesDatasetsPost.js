//@ts-check
"use strict";
/**
 * ./requests/DatasetsPostRequest.js
 * prepares data and response for the devices datasets post path 
 */
const enums = require('../host/enums');
const consts = require('../host/constants');

const Response = require('../responses');
const DatasetsPostResponse = require('../responses/DevicesDatasetsPostResponse');

const Request = require('./Request');
const Param = require('../parameters');

const csvparse = require('csv-parse/lib/sync')

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
        isPmsCsv = (contentType == enums.mimeTypes.textCsv) && (dataset == enums.datasets.pms);     // text/csv supported for pms only
        //datasets = isPmsCsv ? pmsCsvToJsonDatasets(req.body) : req.body.datasets;                   // for text/csv req body contains raw csv content, for application/json the req.body is a 'datasets' object with array of datasets {"datasets": [.. ]                        
        if (isPmsCsv) {
            console.log('@')  // @@@@@

            datasets = pmsCsvToJsonDatasets(req.body);

            console.log('@@@@')  // @@@@@
            console.log(`datasets.length ${datasets.length}`); // @@@@@
            

        } else {
            datasets = req.body.datasets;
        }


        // parameters                                                       
        let params = {};
        params.dataset = new Param('dataset', dataset, consts.NONE, enums.datasets);
        params.datasets = new Param('datasets', datasets);                                      // for text/csv this is raw csv content 


        // super - validate params, auth, accept header
        super(req, params, DatasetsPostResponse.produces, DatasetsPostResponse.consumes);       // super validates and sets this.accepts this.isValid, this.isAuthorised params valid
        params.apiKey = this.apiKey;                                                            // add apiKey as a param as it is used to produce the sys.source attribute in the Producer  

        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid === true ? new Response.DevicesDatasetsPostResponse(this.params, this.accept) : this.response;

    }

}

// parse csv into json array of datasets - csv must have headers. error rows are skippsed (e.g. missing closing quote)
function pmsCsvToJsonDatasets(csvData) {

    const CELL_VOLTS_COLUMNS = 14;
    const CELL_OPEN_COLUMNS = 14;
    const FET_OPEN_COLUMNS = 2;


    const csvRows = csvparse(`${csvData}`.trim(), {
        columns: true,
        skip_empty_lines: true
    })


    console.log('@@@')  // @@@@@
    console.log(csvRows[0]['pack.id'])  // @@@@@
    console.log(csvRows[1]['pack.id'])  // @@@@@
    console.log(`csvRows.length ${csvRows.length}`); // @@@@@
    //console.dir(csvRows);
    return csvRows 

}

module.exports = DevicesDatasetsPost;


