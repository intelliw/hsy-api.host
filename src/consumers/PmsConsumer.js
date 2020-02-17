//@ts-check
'use strict';
/**
 * ./consumers/Pms.js
 *  
 */
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const csvSyncParse = require('csv-parse/lib/sync')

const enums = require('../environment/enums');
const consts = require('../host/constants');
const env = require('../environment/env');
const utils = require('../environment/utils');

const PmsProducer = require('../producers/PmsProducer');
const Consumer = require('./Consumer');

// instance parameters
const API_PATH_IDENTIFIER = env.active.messagebroker.topics.monitoring.pms;

/**
 */
class PmsConsumer extends Consumer {

    /**
    */
    constructor() {

        // construct consumer and its producer
        super(
            API_PATH_IDENTIFIER,
            new PmsProducer()
        );

    }


    /** transforms the retrieved messages and calls producer to piublish the transformed messages
     * @param {*} senderId                                                                      // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    consume(retrievedMsgObj, senderId) {

        let transformedMsgObj = this.producer.transform(retrievedMsgObj, senderId);
        this.producer.produce(transformedMsgObj, senderId);                                           // async produce() ok as by now we have connected to kafka/pubsub, and the dataset should have been validated and the only outcome is a 200 response

    }

    /** converts the retrieved messages from the specified mime type, to the standard mime type (usually application /json)
    */
    convert(retrievedMsgObj, fromMimeType) {

        let convertedMsgObj = retrievedMsgObj

        // text/csv - only this mime type is supported for conversion
        if (fromMimeType == enums.mimeType.textCsv) {
            convertedMsgObj = this._csvToJson(retrievedMsgObj);
        }

        return convertedMsgObj;
    }

    // pms schema (see https://docs.sundaya.monitored.equipment/docs/api.sundaya.monitored.equipment/0/c/Examples/POST/pms%20POST%20example)
    _getSchema() {

        const schema = Joi.array().items(Joi.object({                           // [
            pms: Joi.object({                                                   //  { "pms": { "id": "PMS-01-001", "temp": 48.3 }, 
                id: Joi.string(),                                               //    
                temp: Joi.number().positive()                                   //      float	+ only 
            }),
            data: Joi.array().items(Joi.object({                                //      "data": [
                time_local: Joi.date().utc().format(this._validTimestampFormats()),   //          "time_local": "20190209T150006.032+0700", 
                pack: Joi.object({                                              //          "pack": { "id": "0241", "dock": 1, "amps": -1.601, "temp": [35.0, 33.0, 34.0],
                    id: Joi.string(),                                                       //      string
                    dock: Joi.number().integer().positive().min(1).max(48),                 //      integer, + only,  1-48
                    amps: Joi.number(),                                                     //      float, +/-
                    temp: Joi.array().items(Joi.number().positive()).min(3).max(3),         //      float (array)	array size 3, + only
                    cell: Joi.object({                                                      // "cell": { "open": [], "volts": [3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.92, 3.91] },
                        volts: Joi.array().items(Joi.number().positive()).min(14).max(14),  //      float (array)	array size 14, + only
                        open: Joi.array().unique().items(Joi.number().integer().positive().max(14)).max(14)     // integer (array)	1-14, uniqueitems, array size 0-14
                    }),
                    fet: Joi.object({                                                       // "load": { "volts": [48.000, 48.000], "amps": [1.2, 1.2] },
                        temp: Joi.array().items(Joi.number().positive()).min(2).max(2),     //      float	array size 2, + only
                        open: Joi.array().unique().items(Joi.number().integer().positive().max(2)).max(2)     // integer (array)	1-2, uniqueitems, array size 2
                    }),
                    status: Joi.string()                                                    // "status": "0801"
                        .hex().length(4)                                                    //      4-character, hex-encoded                    
                }),
            }))
        }));

        return schema;

    }

    // parse csv into json array of datasets - csv must have headers. error rows are skippsed (e.g. missing closing quote)
    _csvToJson(csvData) {

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
            let cellOpen = utils.csvBooleanToColumnPosArray(csvRow, 'cell.open', CELL_OPEN_COLUMNS);
            let cellVolts = utils.csvToFloatArray(csvRow, 'cell.volts', CELL_VOLTS_COLUMNS);
            let fetOpen = utils.csvBooleanToColumnPosArray(csvRow, 'fet.open', FET_OPEN_COLUMNS);

            // converts the csv row into a pms data object 
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
                        open: cellOpen,
                        volts: cellVolts
                    },
                    fet: {
                        open: fetOpen,
                        temp: [
                            parseFloat(csvRow['fet.temp.1']),
                            parseFloat(csvRow['fet.temp.2'])]
                    },
                    status: csvRow['status']
                }
            }

            // add a data object for this csv row, to the 'dataset.data' array
            dataset.data.push(dataObj);

        });

        json.push(dataset);
        return json;

    }


}


module.exports = PmsConsumer;
