//@ts-check
'use strict';
/**
 * ./producers/MonitoringInverter.js
 *  base type for Kafka message producers  
 */
const ActiveMsgProducer = require('../producers').ActiveMsgProducer;

const consts = require('../host/constants');

const env = require('../environment/env');
const enums = require('../environment/enums');
const utils = require('../environment/utils');
const log = require('../logger').log;

const moment = require('moment');

const API_PATH_IDENTIFIER = enums.params.datasets.inverter;
const WRITE_TOPIC = env.active.messagebroker.topics.monitoring.inverter;

/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class MonitoringInverter extends ActiveMsgProducer {

    /**
     * instance attributes:  
     * apiPathIdentifier                                                // enums.params.datasets
     * writeTopic                                                       // env.active.messagebroker.topics.monitoring
     * constructor arguments 
     * @param {*}                                                                   
     */
    constructor() {

        super(API_PATH_IDENTIFIER, WRITE_TOPIC);

    }

    /**
     * creates an array of messagebroker messages and returns them in a results object
     */
    _extractData(datasets, sender) {

        let key
        let dataItemCount = 0;

        let volts, amps, watts, pf;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;
        const ITEMNUMBER_LENGTH = 2;                                                                // how many digits int he cell number e.g 02
        const SQ_ROOT_OF_THREE = Math.sqrt(3);

        let msgObj = { itemCount: 0, messages: [] };

        // extract and add messages to results 
        datasets.forEach(dataset => {

            key = dataset.inverter.id;

            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                                                  // e.g. "data": [ { "time_local": "2

                //  reconstruct dataitem - add new attributes and flatten arrays 
                let dataObj = {
                    inverter_id: key,
                    time_local: dataItem.time_local                                                         // this gets replaced and deleted in addGenericAttributes()
                }

                // pv
                attrArray = [];
                for (let i = 1; i <= dataItem.pv.volts.length; i++) {
                    volts = dataItem.pv.volts[i - 1];
                    amps = dataItem.pv.amps[i - 1];
                    watts = (volts * amps).toFixed(PRECISION);

                    attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
                };
                dataObj.pv = attrArray;                                                                     // "pv": [ {"volts": 48, "amps": 6, "watts": 288 },

                // battery
                volts = dataItem.battery.volts;
                amps = dataItem.battery.amps;
                watts = (volts * amps).toFixed(PRECISION);

                dataObj.battery = {                                                                         //   "battery": {
                    volts: volts, amps: amps, watts: parseFloat(watts)                                      //      "volts": 55.1, "amps": 0.0, "watts": 0 },
                }

                // load
                attrArray = [];
                for (let i = 1; i <= dataItem.load.volts.length; i++) {
                    volts = dataItem.load.volts[i - 1];
                    amps = dataItem.load.amps[i - 1];
                    watts = (volts * amps).toFixed(PRECISION);

                    attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
                };
                dataObj.load = attrArray;                                                                   // "load": [ {"volts": 48, "amps": 6, "watts": 288 },


                // grid
                attrArray = [];
                for (let i = 1; i <= dataItem.grid.volts.length; i++) {
                    attrArray.push({
                        volts: dataItem.grid.volts[i - 1],
                        amps: dataItem.grid.amps[i - 1],
                        pf: dataItem.grid.pf[i - 1],
                        watts: (volts * amps * pf * SQ_ROOT_OF_THREE).toFixed(PRECISION)                    // grid.watts == V x I x pf x √3  
                    });
                };
                dataObj.grid = attrArray;

                // status
                let statusBits = utils.hex2bitArray(dataItem.status, consts.equStatus.BIT_LENGTH);         // get a reversed array of bits (bit 0 is least significant bit)
                dataObj.status = {
                    bus_connect: utils.tristateBoolean(statusBits[0], false, true)                         // bit 0    "status": { "bus_connect": true }, 
                }


                // add generic attributes
                let dataItemClone = super.addGenericAttributes(dataObj, sender);                // clone the dataItem and add common attributes (time_event, time_zone, time_processing)

                // add the dataitem to the message buffer
                msgObj.messages.push(super.createMessage(key, dataItemClone));                 // add to the message array

            });

            // replace data array with newly created dataItems array
            dataItemCount += dataset.data.length;


        });

        msgObj.itemCount = dataItemCount;
        return msgObj;

    }

}



module.exports = MonitoringInverter;
