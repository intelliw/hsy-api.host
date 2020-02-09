//@ts-check
'use strict';
/**
 * ./producers/MonitoringPms.js
 *  base type for Kafka message producers  
 */
const ActiveMsgProducer = require('../producers').ActiveMsgProducer;

const consts = require('../host/constants');

const env = require('../environment/env');
const enums = require('../environment/enums');
const utils = require('../environment/utils');
const log = require('../logger').log;

const moment = require('moment');

const API_PATH_IDENTIFIER = enums.params.datasets.pms;
const WRITE_TOPIC = env.active.messagebroker.topics.monitoring.pms;

/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class MonitoringPms extends ActiveMsgProducer {

    /**
     * instance attributes:  
     * apiPathIdentifier                                                            // enums.params.datasets
     * writeTopic                                                                   // env.active.messagebroker.topics.monitoring
     * constructor arguments 
     * @param {*} apiPathIdentifier                                                 // enums.params.datasets              - e.g. pms       
     */
    constructor() {

        super(API_PATH_IDENTIFIER, WRITE_TOPIC);

    }


    /**
     * creates an array of messagebroker messages and returns them in a results object
     *  datasets - object array of dataset items. 
     *      the *array* (of datasets) in the req.body e.g. the [.. ] array in {"datasets": [.. ] ..}
     *  each dataset item has an id and an array of data objects
     *  each data object has a time_local event timestamp
     *  dataset objects have a common structure
     *  the id property must be in an object named after the dataset 
     *      e.g. { "pms": { "id": "PMS-01-001" },  "data": [ { "time_local": "20190209T150006.032+0700", ..]
     * the returned results object contains these properties
     *  itemCount  - a count of the total number of dataitems in all datasets / message
     *  messages[] - array of kafka messages, includes key,. value, header attributes (header is optional)
     *              each message.value contains a dataset with modified data items
     *  returned results object, e.g. :
     *  { itemCount: 1,
     *    messages: [ 
     *    { key: 'TEST-01',
     *      value: '{"pms":{"id":"TEST-01"},"data":[{"pack":{"id":"0241","dock":1,"amps":-1.601,"temp":[35,33,34],"cell":{"open":[],"volts":[3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.91]},"fet":{"open":[1,2],"temp":[34.1,32.2]},"status":"0001"},"sys":{"source":"STAGE001"},"time_event":"2019-09-09 08:00:06.0320","time_zone":"+07:00","time_processing":"2019-12-17 04:07:20.7790"}]}' 
     *      } ]
     *   }
     */
    _extractData(datasets, sender) {

        let key
        let dataItemCount = 0;
        let vcl, vch, dvcl, volts, watts;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;
        const TO_MILLIVOLTS = 1000;
        const TEMP_TOP_INDEX = 1, TEMP_MID_INDEX = 2, TEMP_BOTTOM_INDEX = 3;
        const FET_IN_INDEX = 1, FET_OUT_INDEX = 2;


        let results = { itemCount: 0, messages: [] };

        // extract and add messages to results 
        datasets.forEach(dataset => {                                                           // e.g. "pms": { "id": "PMS-01-001" }, "data": [ { time_local: '20190809T150006.032+0700', pack: [Object] }, ... ]

            key = dataset.pms.id;                                                               // e.g. dataset.pms.id - from.. "pms": { "id": 

            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                                                  // e.g. "data": [ { "time_local": "2

                let p = dataItem.pack;                                                          // all data objects in the sent message are inside pack

                vcl = Math.min(...p.cell.volts);
                vch = Math.max(...p.cell.volts);
                dvcl = p.cell.volts.map(element => (parseFloat(((element - vcl) * TO_MILLIVOLTS).toFixed())));  // make an array of dvcl
    
                // pack.volts,  pack.watts
                volts = dataItem.pack.cell.volts.reduce((sum, x) => sum + x).toFixed(PRECISION);                // sum all the cell volts to get pack volts
                watts = (volts * dataItem.pack.amps).toFixed(PRECISION);

                //  reconstruct dataitem - add new attributes and flatten arrays 
                let dataObj = {
                    pms_id: key,                                                                // { "pms_id": "PMS-01-002",
                    pack_id: p.id,                                                              //   "pack_id": "0248",
                }

                // pms
                dataObj.pms = {                                                                 //   "pms": {   
                    temp: dataset.pms.temp                                                      //   get temp from dataset  e.g. { "pms": { "id": "PMS-01-001", "temp": 48.3 },     
                }

                // pack    
                dataObj.pack = {                                                                                  //   "pack": {   
                    volts: parseFloat(volts), amps: p.amps, watts: parseFloat(watts),           //      "volts": 51.262, "amps": -0.625, "watts": -32.039,    
                    vcl: vcl, vch: vch, dock: parseInt(p.dock),                                 //      "vcl": 3.654, "vch": 3.676, "dock": 4, 
                    temp_top: p.temp[TEMP_TOP_INDEX - 1],                                       //      "temp_top": 35, "temp_mid": 33, "temp_bottom": 34 },
                    temp_mid: p.temp[TEMP_MID_INDEX - 1],
                    temp_bottom: p.temp[TEMP_BOTTOM_INDEX - 1]
                }

                // cells   
                attrArray = [];
                for (let i = 1; i <= p.cell.volts.length; i++) {
                    attrArray.push({
                        volts: p.cell.volts[i - 1],                                             //      { "volts": 3.661,         
                        dvcl: dvcl[i - 1],                                                      //      "dvcl": 7,  
                        open: p.cell.open.includes(i) ? true : false                            //      "open": false },             
                    });
                };
                dataObj.cell = attrArray;                                                       // "cell": [ { "volts": 3.661, "dvcl": 7, "open": false },

                // fets
                dataObj.fet_in = {                                                              // "fet_in": {
                    open: p.fet.open.includes(FET_IN_INDEX) ? true : false,                     //      "open": false, 
                    temp: p.fet.temp[FET_IN_INDEX - 1]                                          //      "temp": 34.1 },        
                }
                dataObj.fet_out = {                                                             // "fet_out": {
                    open: p.fet.open.includes(FET_OUT_INDEX) ? true : false,                    //      "open": false, 
                    temp: p.fet.temp[FET_OUT_INDEX - 1]                                         //      "temp": 32.2 },        
                }

                // status
                let statusBits = utils.hex2bitArray(p.status, consts.equStatus.BIT_LENGTH);     // get a reversed array of bits (bit 0 is least significant bit)
                dataObj.status = {
                    bus_connect: utils.tristateBoolean(statusBits[0], false, true)              // bit 0    "status": { "bus_connect": true }, 
                }

                // add generic attributes
                let dataItemClone = super.addGenericAttributes(dataObj, sender);                // clone the dataItem and add common attributes (time_event, time_zone, time_processing)

                // add the dataitem to the message buffer
                results.messages.push(super.createMessage(key, dataItemClone));                 // add to the message array

            });

            // replace data array with newly created dataItems array
            dataItemCount += dataset.data.length;


        });
        
        results.itemCount = dataItemCount;
        return results;

    }

}



module.exports = MonitoringPms;
