//@ts-check
'use strict';
/**
 * ./producers/PmsProducer.js
 *  base type for Kafka message producers  
 */

const consts = require('../host/constants');

const env = require('../environment/env');
const enums = require('../environment/enums');
const utils = require('../environment/utils');
const log = require('../logger').log;

const moment = require('moment');

const Producer = require('./Producer');

const WRITE_TOPIC = env.active.messagebroker.topics.timeseries.pms;

/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class PmsProducer extends Producer{

    /**
     * instance attributes:  
     * constructor arguments 
     * @param {*}                                                                   
     */
    constructor() {

        super(WRITE_TOPIC);
        
    }

    /**
     * creates an array of messagebroker messages and returns them in a results object
     */
    transform(datasets, senderId) {

        let key, status;
        let dataItemCount = 0;
        let vcl, vch, dvcl, volts, watts;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;
        const TO_MILLIVOLTS = 1000;
        const TEMP_TOP_INDEX = 1, TEMP_MID_INDEX = 2, TEMP_BOTTOM_INDEX = 3;
        const FET_IN_INDEX = 1, FET_OUT_INDEX = 2;


        let transformedMsgObj = { itemCount: 0, messages: [] };

        // extract and add messages to results 
        datasets.forEach(dataset => {                                                           // e.g. "pms": { "id": "PMS-01-001" }, "data": [ { time_local: '20190809T150006.032+0700', pack: [Object] }, ... ]

            key = dataset.pms_id;                                                               // e.g. { "pms_id": "PMS-01-001", 
            status = dataset.status;                                                            //      "status": { "code": "0001", "temp": 48.3 }

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
                    pack_id: p.id                                                               //   "pack_id": "0248",                  //  top level field as required by BQ for clustering (instead of pack.id) 
                }

                // pack    
                dataObj.pack = {                                                                
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
                attrArray = [];
                attrArray.push({                                                                // Fet In
                    open: p.fet.open.includes(FET_IN_INDEX) ? true : false,                     //      "open": false, 
                    temp: p.fet.temp[FET_IN_INDEX - 1]                                          //      "temp": 34.1 },        
                });
                attrArray.push({                                                                // Fet Out
                    open: p.fet.open.includes(FET_IN_INDEX) ? true : false,                     //      "open": false, 
                    temp: p.fet.temp[FET_IN_INDEX - 1]                                          //      "temp": 34.1 },        
                });
                dataObj.fet = attrArray;                                                        // "fet": [ { "open": true, "temp": 34.1 },

                // status
                let statusBits = utils.hex2bitArray(status.code, consts.equStatus.BIT_LENGTH);  // get a reversed array of bits (bit 0 is least significant bit)
                dataObj.status = {
                    bus_connect: utils.tristateBoolean(statusBits[0], false, true),             // bit 0    "status": { "bus_connect": true }, 
                    temp: status.temp                                                           // get temp from dataset.status  e.g. { "pms": { "id": "PMS-01-001", "temp": 48.3 },     
                }

                // add generic attributes
                dataObj = this._addMetadata(dataObj, dataItem.time_local, senderId);       //  "sys": { "source": "STAGE001" },

                // add the dataitem to the message buffer
                transformedMsgObj.messages.push(super._createMessage(key, dataObj));                 // add to the message array
            });

            // replace data array with newly created dataItems array
            dataItemCount += dataset.data.length;


        });
        
        transformedMsgObj.itemCount = dataItemCount;
        return transformedMsgObj;

    }

}



module.exports = PmsProducer;
